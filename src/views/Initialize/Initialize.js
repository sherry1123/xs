import React, {Component} from 'react';
import {connect} from 'react-redux';
import update from "react-addons-update";
import {Button, Divider, Form, Icon, Input, message, notification, Popover, Progress, Steps, Switch} from 'antd';
import QueueAnim from 'rc-queue-anim';
import LanguageButton from '../../components/Language/LanguageButton';
import ArrowButton from '../../components/ArrowButton/ArrowButton';
import RAIDConfiguration from '../../components/RAIDConfiguration/RAIDConfiguration';
import initializeAction from '../../redux/actions/initializeAction';
import lang from '../../components/Language/lang';
import {validateIpv4, KeyPressFilter} from '../../services';
import requests from '../../http/requests';
import Cookie from 'js-cookie';
import routerPath from '../routerPath';

class Initialize extends Component {
    constructor (props){
        super(props);
        this.keyPressFilter = new KeyPressFilter();
        let {metadataServerIPs, storageServerIPs, clientIPs, managementServerIPs, floatIPs, hbIPs} = props;
        this.categoryArr = ['metadataServerIPs', 'storageServerIPs', 'clientIPs', 'managementServerIPs', 'floatIPs', 'hbIPs'];
        this.state = {
            currentStep: 0,
            totalStep: 5,
            checking: false,

            metadataServerIPsError: metadataServerIPs.map(() => ({status: '', help: ''})),
            storageServerIPsError: storageServerIPs.map(() => ({status: '', help: ''})),
            clientIPsError: clientIPs.map(() => ({status: '', help: ''})),
            managementServerIPsError: managementServerIPs.map(() => ({status: '', help: ''})),
            floatIPsError: floatIPs.map(() => ({status: '', help: ''})),
            hbIPsError: hbIPs.map(() => ({status: '', help: ''})),

            initProgress: 0,
            initializationInfo: [lang('初始化已开始，请稍候...', 'Initializing, pleas wait for a moment ...')]
        };
    }

    componentWillMount (){
        let isInitialized = Cookie.get('init');
        if (isInitialized === 'true'){
            let isLoggedIn = Cookie.get('login');
            let path = '';
            if (!isLoggedIn || (isLoggedIn === 'false')){
                path = routerPath.Login;
            } else {
                path = routerPath.Main + routerPath.StorageNodes;
            }
            this.props.history.replace(path);
        }
    }

    async setEnableHA (checked){
        if (checked){
            await this.addIP('managementServerIPs');
            notification.open({
                message: lang('提示', 'Tooltip'),
                description: lang('您已为管理服务器启用HA，请配置两个有效的管理服务器IP及对应的HB IP，并配置存储集群服务管理IP。这些设置将确保HA功能能够正常工作。',
                    'You have enabled HA for management server, please configure two valid management server IPs and corresponding Heartbeat IPs, also the storage cluster service management IP needs to be configured. All those settings will ensure that the HA function can work properly.')
            });
        } else {
            await this.removeIP('managementServerIPs', 1);
        }
        await this.props.setEnableHA(checked);
    }

    setEnableRAID (checked){
        this.props.setEnableRAID(checked);
    }

    async addIP (category){
        this.props.addIP(category);
        // add corresponding validation obj
        let errorArr = this.state[category + 'Error'];
        await this.setErrorArr(category, errorArr.length, {status: '', help: ''}, 0);
    }

    async removeIP (category, i){
        this.props.removeIP(category, i);
        // remove corresponding validation obj
        await this.setErrorArr(category, i, 'remove');
    }

    setIP (category, i, value){
        this.props.setIP(category, i, value);
    }

    keyCodeFilter (event){
        this.keyPressFilter.do(event);
    }

    async setErrorArr (category, i, errorObj){
        // modify nesting object or array state is complex, move these operations into reducer may be better
        let mutation = errorObj === 'remove' ? [i, 1] : [i, 1, errorObj];
        let updateData = {};
        updateData[category + 'Error'] = {$splice: [mutation]};
        let newState = update(this.state, updateData);
        await this.setState(Object.assign(this.state, newState));
    }

    async validateIP (category, i, value){
        // validate ipv4 address pattern
        if (!validateIpv4(value)){
            let help = !value ? lang('请输入IP', 'please enter IP') : lang('IP格式错误', 'IP pattern error');
            await this.setErrorArr(category, i, {status: 'error', help});
        } else {
            // validate whether this ip is duplicated with an existing one in its server category
            let currentIPs = this.props[category];
            let duplicated = currentIPs.some((ip, index) => (ip === value && index !== i));
            if (duplicated){
                await this.setErrorArr(category, i, {status: 'error', help: lang('IP在这个服务器类型中有重复', 'IP is duplicated in this server category')});
            } else {
                // duplicate validate successfully
                if (!!this.state[category + 'Error'][i].status){
                    await this.setErrorArr(category, i, {status: '', help: ''});
                    // if it's mgmt server IP and need to do HA validation
                    if (category === 'managementServerIPs' && this.props.enableHA){
                        await this.validateIPForHA();
                        await this.validateNetworkSegmentForMgmtAndHAIPs();
                    }
                }
            }
        }
    }

    async validateIPForHA (){
        // once enabled HA for management server, management server IPs shouldn't be the same with any of metadata, storage or client server IPs
        let {metadataServerIPs, storageServerIPs, clientIPs, managementServerIPs} = this.props;
        let errorHelp = lang('为管理服务器启用HA后，管理服务器IP不能与任何元数据、存储服务器或客户端IP相同', 'once enabled HA for mgmt server, mgmt server IPs shouldn\'t be the same with any of metadata, storage server or client IPs');
        for (let i = 0; i < managementServerIPs.length; i ++){
            let managementServerIP = managementServerIPs[i];
            if (managementServerIP){
                if (metadataServerIPs.includes(managementServerIP) ||
                    storageServerIPs.includes(managementServerIP) ||
                    clientIPs.includes(managementServerIP)
                ){
                    await this.setErrorArr('managementServerIPs', i, {status: 'error', help: errorHelp});
                } else {
                    if (!!this.state.managementServerIPsError[i].status){
                        console.info('清除', this.state.managementServerIPsError[i].status);
                        await this.setErrorArr('managementServerIPs', i, {status: '', help: ''});
                    }
                }
            }
        }
    }

    async validateNetworkSegmentForMgmtAndHAIPs (){
        if (this.state.managementServerIPsError[0].status || this.state.managementServerIPsError[1].status){
            // management server IPs haven't pass the basic validation
            return;
        }
        // a more graceful way to validate network segment is using net mask to do binary '&' operations,
        // but currently it hasn't been provided yet or let customers to enter, so there's no way to get it
        let {managementServerIPs: [mgmtIP1, mgmtIP2], hbIPs: [hbIP1, hbIP2]} = this.props;
        let errorHelp = lang('管理服务器IP不能与和它对应的集群服务管理IP处于相同网段', 'Management Server IP shouldn\'t be in the same network segment with its corresponding Heartbeat IP');
        let [mgmtIP1_1, mgmtIP1_2, mgmtIP1_3] = mgmtIP1.split('.');
        let [hbIP1_1, hbIP1_2, hbIP1_3] = hbIP1.split('.');
        if (!(mgmtIP1_1 !== hbIP1_1 || mgmtIP1_2 !== hbIP1_2 || mgmtIP1_3 !== hbIP1_3)){
            await this.setErrorArr('managementServerIPs', 0, {status: 'error', help: errorHelp});
        } else {
            if (!!mgmtIP1){
                await this.setErrorArr('managementServerIPs', 0, {status: '', help: ''});
            }
        }
        let [mgmtIP2_1, mgmtIP2_2, mgmtIP2_3] = mgmtIP2.split('.');
        let [hbIP2_1, hbIP2_2, hbIP2_3] = hbIP2.split('.');
        if (!(mgmtIP2_1 !== hbIP2_1 || mgmtIP2_2 !== hbIP2_2 || mgmtIP2_3 !== hbIP2_3)){
            await this.setErrorArr('managementServerIPs', 1, {status: 'error', help: errorHelp});
        } else {
            if (!!mgmtIP1){
                await this.setErrorArr('managementServerIPs', 1, {status: '', help: ''});
            }
        }
    }

    isNoError (){
        let validated = true;
        for (let category of this.categoryArr){
            let errors = this.state[category + 'Error'];
            for (let error of errors) {
                if (error.help && error.status){
                    validated = false;
                    break;
                }
            }
        }
        return validated;
    }

    prev (){
        this.setState({currentStep: this.state.currentStep - 1});
    }

    async next (){
        let next = this.state.currentStep + 1;
        switch (next){
            case 1:
                await this.setState({checking: true});
                // validate basic pattern of all IPs
                await Promise.all(this.categoryArr.map(async (category) => {
                    let ips = this.props[category];
                    let len = ips.length;
                    for (let i = 0; i < len; i ++){
                        await this.validateIP(category, i, ips[i]);
                    }
                }));

                // validate HA if enabled
                if (this.isNoError() && this.props.enableHA){
                    await this.validateIPForHA();
                    await this.validateNetworkSegmentForMgmtAndHAIPs();
                }

                // the final validation
                if (this.isNoError()){
                    let checkResult = await requests.checkIPs();
                    if (checkResult){
                        this.setState({currentStep: next});
                    } else {
                        // check IPs availabilities form server
                        message.error(lang('经检测有IP不能正常使用，请更换', 'Some IPs seem can not be used properly through the validations，please replace them'));
                    }
                } else {
                    message.error(lang('IP输入验证没有通过，请先修正', 'IP input validation did not pass, please correct the error one(s) firstly'));
                }
                await this.setState({checking: false});
                break;
            case 2:
                if (!this.state.enableRAID){
                    this.setState({currentStep: next});
                } else {

                }
                break;
            case 3:
                this.setState({currentStep: next});
                this.startInitialization();
                break;
            default:
                break;
        }
    }

    startInitialization (){
        let initProgress = this.state.initProgress;
        let initTimer = setInterval(async () => {
            initProgress += (initProgress === 10 || initProgress === 40 || initProgress === 70 ? 10 : 1);
            let info = `initialize xxx server, ${lang('进度:', 'progress:')} ${initProgress}%`;
            let infoArr = initProgress === 100 ? [info, lang('初始化已完成!', 'Initialization done!')] : [info];
            let newState =  update(this.state, {
                initializationInfo: {$unshift: infoArr},
                initProgress: {$set: initProgress}
            });
            await this.setState(Object.assign(this.state, newState));
            let list = this.initInfoWrapper;
            list && (list.scrollTop = list.scrollHeight);
            if (initProgress === 100){
                clearInterval(initTimer);
                setTimeout(() => this.setState({currentStep: 4}), 1500);
                if (process.env.NODE_ENV === 'development'){
                    Cookie.set('init', 'true');
                }
            }
        }, 300);
    }

    forwardLogin (){
        this.props.history.push(routerPath.Login);
    }

    render (){
        return (
            <section className="fs-initialize-wrapper">
                <section className="fs-initialize-language-btn-wrapper" style={{marginRight: 30}}>
                    <LanguageButton pureText />
                </section>
                <section key="initialize-title" className="fs-initialize-welcome-wrapper">
                    {lang(
                        '欢迎进入OrcaFS初始化向导。您将通过以下步骤初始化您的存储集群：',
                        'Welcome to the OrcaFS initialization wizard. Just follow these steps below to initialize your storage cluster: '
                    )}
                </section>
                <Steps key="initialize-step" className="fs-initialize-step-index-wrapper" current={this.state.currentStep}>
                    <Steps.Step title={lang('定义角色', 'Define Roles')} />
                    <Steps.Step title={lang('确认角色', 'Confirm Roles')} />
                    <Steps.Step title={lang('配置RAID', 'Configure RAID')} />
                    <Steps.Step title={lang('开始初始化', 'Start Initialization')} />
                    <Steps.Step title={lang('完成', 'Complete')} />
                </Steps>
                <Divider className="fs-initialize-divider-wrapper" dashed />
                <section className="fs-initialize-step-content-wrapper">
                    {
                        this.state.currentStep === 0 &&
                        <div className="fs-initialize-step-content">
                            <QueueAnim type="top" duration={200}>
                                <section key={1} className="fs-step-title">
                                    {lang(
                                        '步骤1：请定义存储集群相应的服务器IP和管理IP。',
                                        'Step1: Please define the corresponding service IPs and management IPs of storage cluster.'
                                    )}
                                </section>
                            </QueueAnim>
                            <div className="fs-ip-input-group">
                                <QueueAnim delay={250}>
                                    <section key="ip-input-1" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">
                                            <Popover placement="top" content={lang('元数据服务器允许配置0至N个', 'Allow 0 to N metadata servers to be configured')}>
                                                {lang('元数据服务器', 'Metadata Servers')}
                                            </Popover>
                                        </Divider>
                                        <QueueAnim type={['right', 'left']}>
                                            {this.props.metadataServerIPs.map((ip, i) =>
                                                <Form.Item className="fs-ip-input-item" key={`metadata-servers-${i}`}
                                                    validateStatus={this.state['metadataServerIPsError'][i].status}
                                                    help={this.state['metadataServerIPsError'][i].help}
                                                >
                                                    <Input className="fs-ip-input" defaultValue={ip} size="small"
                                                        placeholder={lang('请输入IP', 'please enter IP')}
                                                        onKeyDown={event => {this.keyCodeFilter(event)}}
                                                        onKeyUp={({target: {value}}) => {
                                                            this.setIP.bind(this, 'metadataServerIPs', i, value)();
                                                            this.validateIP.bind(this, 'metadataServerIPs', i, value)();
                                                        }}
                                                        addonAfter={
                                                            i !== 0 && <Button title={lang('移除', 'remove')} icon="minus" size="small"
                                                                className="fs-ip-sub-btn" onClick={this.removeIP.bind(this, 'metadataServerIPs', i)} />
                                                        }
                                                    />
                                                </Form.Item>)
                                            }
                                        </QueueAnim>
                                        <Button className="fs-ip-plus-btn" title={lang('添加', 'add')} icon="plus" size="small"
                                            onClick={this.addIP.bind(this, 'metadataServerIPs')} />
                                    </section>
                                    <section key="ip-input-2" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">
                                            <Popover placement="top" content={lang('存储服务器允许配置0至N个', 'Allow 0 to N storage servers to be configured')}>
                                                {lang('存储服务器', 'Storage Servers')}
                                            </Popover>
                                        </Divider>
                                        <QueueAnim type={['right', 'left']}>
                                            {this.props.storageServerIPs.map((ip, i) =>
                                                <Form.Item className="fs-ip-input-item" key={`storage-servers-${i}`}
                                                    validateStatus={this.state['storageServerIPsError'][i].status}
                                                    help={this.state['storageServerIPsError'][i].help}
                                                >
                                                    <Input className="fs-ip-input" defaultValue={ip} size="small"
                                                        placeholder={lang('请输入IP', 'please enter IP')}
                                                        onKeyDown={event => {this.keyCodeFilter(event)}}
                                                        onKeyUp={({target: {value}}) => {
                                                            this.setIP.bind(this, 'storageServerIPs', i, value)();
                                                            this.validateIP.bind(this, 'storageServerIPs', i, value)();
                                                        }}
                                                        addonAfter={
                                                            i !== 0 && <Button title={lang('移除', 'remove')} icon="minus" size="small"
                                                                className="fs-ip-sub-btn" onClick={this.removeIP.bind(this, 'storageServerIPs', i)} />
                                                        }
                                                    />
                                                </Form.Item>)
                                            }
                                        </QueueAnim>
                                        <Button className="fs-ip-plus-btn" title={lang('添加', 'add')} icon="plus" size="small"
                                            onClick={this.addIP.bind(this, 'storageServerIPs')} />
                                    </section>
                                    <section key="ip-input-3" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">
                                            <Popover placement="top" content={lang('客户端允许配置0至N个', 'Allow 0 to N clients to be configured')}>
                                                {lang('客户端', 'Clients')}
                                            </Popover>
                                        </Divider>
                                        <QueueAnim type={['right', 'left']}>
                                            {this.props.clientIPs.map((ip, i) =>
                                                <Form.Item className="fs-ip-input-item" key={`clients-${i}`}
                                                    validateStatus={this.state['clientIPsError'][i].status}
                                                    help={this.state['clientIPsError'][i].help}
                                                >
                                                    <Input className="fs-ip-input" defaultValue={ip}  size="small"
                                                        placeholder={lang('请输入IP', 'please enter IP')}
                                                        onKeyDown={event => {this.keyCodeFilter(event)}}
                                                        onKeyUp={({target: {value}}) => {
                                                            this.setIP.bind(this, 'clientIPs', i, value)();
                                                            this.validateIP.bind(this, 'clientIPs', i, value)();
                                                        }}
                                                        addonAfter={
                                                            i !== 0 && <Button title={lang('移除', 'remove')} icon="minus" size="small"
                                                                className="fs-ip-sub-btn" onClick={this.removeIP.bind(this, 'clientIPs', i)} />
                                                        }
                                                    />
                                                </Form.Item>)
                                            }
                                        </QueueAnim>
                                        <Button className="fs-ip-plus-btn" title={lang('添加', 'add')} icon="plus" size="small"
                                            onClick={this.addIP.bind(this, 'clientIPs')} />
                                    </section>
                                    <section key="ip-input-4" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">
                                            <Popover placement="top" content={lang('管理服务器允许配置1至2个', 'Allow 1 to 2 management servers to be configured')}>
                                                {lang('管理服务器', 'Management Server')}
                                            </Popover>
                                        </Divider>
                                        <QueueAnim type={['right', 'left']}>
                                            {this.props.managementServerIPs.map((ip, i) =>
                                                <Form.Item className="fs-ip-input-item" key={`management-server-${i}`}
                                                    validateStatus={this.state['managementServerIPsError'][i].status}
                                                    help={this.state['managementServerIPsError'][i].help}
                                                >
                                                    <Input className="fs-ip-input" defaultValue={ip} size="small"
                                                        addonBefore={this.props.enableHA ? lang(`节点${i + 1}`, `Node ${i + 1}`) : ''}
                                                        placeholder={lang('请输入IP', 'please enter IP')}
                                                        onKeyDown={event => {this.keyCodeFilter(event)}}
                                                        onKeyUp={({target: {value}}) => {
                                                            this.setIP.bind(this, 'managementServerIPs', i, value)();
                                                            this.validateIP.bind(this, 'managementServerIPs', i, value)();
                                                        }}
                                                    />
                                                </Form.Item>)
                                            }
                                        </QueueAnim>
                                        <Divider dashed style={{margin: "12px 0"}} />
                                        <div className="fs-ip-input-item">
                                            <label className="fs-enable-ha-label">{lang('为管理服务器启用HA', 'Enable HA for Mgmt Server')}</label>
                                            <Switch size="small" style={{float: 'right', marginTop: 3}} title={this.props.enableHA ? lang('点击不启用', 'Click to disabled') : lang('点击开启', 'Click to enable')}
                                                checked={this.props.enableHA}
                                                onChange={this.setEnableHA.bind(this)}
                                            />
                                        </div>
                                        <Divider dashed style={{margin: "12px 0"}} />
                                        {this.props.enableHA &&
                                            <div>
                                                {this.props.hbIPs.map((ip, i) =>
                                                    <Form.Item className="fs-ip-input-item" key={`hb-${i}`}
                                                        label={i === 0 ? lang('心跳IP', 'Heartbeat IP') : null}
                                                        validateStatus={this.state['hbIPsError'][i].status}
                                                        help={this.state['hbIPsError'][i].help}
                                                    >
                                                        <Input className="fs-ip-input" defaultValue={ip} size="small"
                                                            addonBefore={this.props.enableHA ? lang(`节点${i + 1}`, `Node ${i + 1}`) : ''}
                                                            placeholder={lang('请输入HB IP', 'please enter HB IP')}
                                                            onKeyDown={event => {this.keyCodeFilter(event)}}
                                                            addonAfter={
                                                                <Popover placement="right" content={lang(`对应管理服务器节点${i + 1}`, `Corresponding with management server Node ${i + 1}`)}>
                                                                    <Icon type="question-circle-o" className="fs-info-icon m-l" />
                                                                </Popover>
                                                            }
                                                            onKeyUp={({target: {value}}) => {
                                                                this.setIP.bind(this, 'hbIPs', i, value)();
                                                                this.validateIP.bind(this, 'hbIPs', i, value)();
                                                            }}
                                                        />
                                                    </Form.Item>)
                                                }
                                                {this.props.floatIPs.map((ip, i) =>
                                                    <Form.Item className="fs-ip-input-item" key={`float-${i}`}
                                                        label={i === 0 ? lang('存储集群服务管理IP', 'Cluster Service Mgmt IP') : null}
                                                        validateStatus={this.state['floatIPsError'][i].status}
                                                        help={this.state['floatIPsError'][i].help}
                                                    >
                                                        <Input className="fs-ip-input" defaultValue={ip} size="small"
                                                            placeholder={lang('请输入存储服务器集群管理IP', 'please enter cluster service management IP')}
                                                            onKeyDown={event => {this.keyCodeFilter(event)}}
                                                            addonAfter={
                                                                <Popover placement="right" content={lang(`该IP首次将默认映射至管理服务器节点${i + 1}的IP上`, `This IP will be mapped to the IP of management server Node ${i + 1} firstly by default`)}>
                                                                    <Icon type="question-circle-o" className="fs-info-icon m-l" />
                                                                </Popover>
                                                            }
                                                            onKeyUp={({target: {value}}) => {
                                                                this.setIP.bind(this, 'floatIPs', i, value)();
                                                                this.validateIP.bind(this, 'floatIPs', i, value)();
                                                            }}
                                                        />
                                                    </Form.Item>)
                                                }
                                            </div>
                                        }
                                    </section>
                                </QueueAnim>
                            </div>
                        </div>
                    }
                    {
                        this.state.currentStep === 1 &&
                        <div className="fs-initialize-step-content">
                            <QueueAnim type="top" delay={200}>
                                <section key={1} className="fs-step-title">
                                    {lang(
                                        '步骤2：请核对各项IP地址是否输入正确。若发现任何问题，请点击"上一步"进行修改；若确认无误，请点击"下一步"进行初始化。一旦开始初始化，将无法做任何修改。',
                                        'Step1: Please check whether the IP addresses are all correct, if they are any correct, click "Next" to starting initializing. If there is any incorrect IP, click "Previous" and correct it. Once the initialization is started, no changes can be made.'
                                    )}
                                </section>
                            </QueueAnim>
                            <div className="fs-ip-input-group">
                                <QueueAnim type="bottom">
                                    <section key="ip-confirm-1" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">{lang('元数据服务器', 'Metadata Servers')}</Divider>
                                        {this.props.metadataServerIPs.map((ip, i) =>
                                            <Form.Item className="fs-ip-input-item fs-t-c" key={i}>
                                                <span>{ip}</span>
                                            </Form.Item>)
                                        }
                                    </section>
                                    <section key="ip-confirm-2" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">{lang('存储服务器', 'Storage Servers')}</Divider>
                                        {this.props.storageServerIPs.map((ip, i) =>
                                            <Form.Item className="fs-ip-input-item fs-t-c" key={i}>
                                                <span>{ip}</span>
                                            </Form.Item>)
                                        }
                                    </section>
                                    <section key="ip-confirm-3" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">{lang('客户端', 'Clients')}</Divider>
                                        {this.props.clientIPs.map((ip, i) =>
                                            <Form.Item className="fs-ip-input-item fs-t-c" key={i}>
                                                <span>{ip}</span>
                                            </Form.Item>)
                                        }
                                    </section>
                                    <section key="ip-confirm-4" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">{lang('管理服务器', 'Mangement Server')}</Divider>
                                        {this.props.managementServerIPs.map((ip, i) =>
                                            <Form.Item className="fs-ip-input-item fs-t-c" key={i}>
                                                <span>{ip}</span>
                                            </Form.Item>)
                                        }
                                        {this.props.enableHA &&
                                            <div>
                                                <Divider dashed style={{margin: "12px 0"}} />
                                                <div className="fs-ip-input-item">
                                                    <label>{lang('管理服务器HA配置', 'Mgmt Server HA Configuration')}</label>
                                                </div>
                                                <Divider dashed style={{margin: "12px 0"}} />
                                                {this.props.floatIPs.map((ip, i) =>
                                                    <Form.Item className="fs-ip-input-item" key={i}
                                                        label={i === 0 ? lang('存储集群服务管理IP', 'Cluster Service Management IP') : null}
                                                    >
                                                        <div className="fs-t-c">{ip}</div>
                                                    </Form.Item>)
                                                }
                                                {this.props.hbIPs.map((ip, i) =>
                                                    <Form.Item className="fs-ip-input-item" key={i}
                                                        label={i === 0 ? lang('心跳IP', 'Heartbeat IP') : null}
                                                    >
                                                        <div className="fs-t-c">{ip}</div>
                                                    </Form.Item>)
                                                }
                                            </div>
                                        }
                                    </section>
                                </QueueAnim>
                            </div>
                        </div>
                    }
                    {
                        this.state.currentStep === 2 &&
                        <div className="fs-initialize-step-content">
                            <QueueAnim type="left" delay={200}>
                                <section key={1} className="fs-step-title">
                                    {lang(
                                        '步骤3：请决定是否为元数据节点和存储节点配置RAID。',
                                        'Step3: Please decide whether configure RAID for metadata nodes & storage nodes or not.'
                                    )}
                                </section>
                            </QueueAnim>
                            <QueueAnim type="right" delay={200}>
                                <section key={1} className="fs-config-raid-wrapper">
                                    <div className="fs-raid-switch-wrapper">
                                        <label >{lang('为元数据节点和存储节点配置RAID', 'Configure RAID for metadata nodes & storage nodes')}</label>
                                        <Switch size="small" checked={this.props.enableRAID} onChange={this.setEnableRAID.bind(this)} />
                                    </div>
                                    {
                                        this.props.enableRAID && <RAIDConfiguration />
                                    }
                                </section>
                            </QueueAnim>
                        </div>
                    }
                    {
                        this.state.currentStep === 3 &&
                        <div className="fs-initialize-step-content">
                            <QueueAnim type="left" delay={200}>
                                <section key={1} className="fs-step-title">
                                    {lang(
                                        '步骤4：初始化已经开始！请保持设备网络畅通，请勿关闭电源。',
                                        'Step4: Initializing has just begun! Please keep the equipment network unblocked, do not turn off the power supply.'
                                    )}
                                </section>
                            </QueueAnim>
                            <QueueAnim type="right">
                                <Progress key={1} className="fs-initialization-progress-bar"
                                    showInfo={false}
                                    percent={this.state.initProgress}
                                    status={this.state.initProgress === 100 ? 'success' : 'active'}
                                    strokeWidth={15}
                                />
                            </QueueAnim>
                            <QueueAnim key={1} type="bottom">
                                <section key="fs-initializing-3" className="fs-initialization-wrapper" ref={ref => this.initInfoWrapper = ref}>
                                    {this.state.initializationInfo.map((info, i) => <p className="fs-initialization-info" key={i}>{info}</p>)}
                                </section>
                            </QueueAnim>
                        </div>
                    }
                    {
                        this.state.currentStep === 4 &&
                        <div className="fs-initialize-step-content">
                            <QueueAnim duration={200}>
                                <section key={1} className="fs-step-title">
                                    <p>
                                        {lang(
                                            '步骤5：初始化已完成，您的存储集群已经准备好了!',
                                            'Step5: The initialization is complete and your storage cluster is ready!'
                                        )}
                                    </p>
                                </section>
                            </QueueAnim>
                            <QueueAnim type="bottom" delay={250}>
                                <section key="fs-initialized-2" className="fs-done-wrapper">
                                    <p>
                                        {lang(
                                            '以下是为您生成的登录账号，请将其记录并保存到一个安全的地方：',
                                            'The following is a login account generated for you, please keep a record of it at a safe place: '
                                        )}
                                    </p>
                                    <p>{lang('管理员帐号', 'Admin Account')}: admin</p>
                                    <p>{lang('管理员密码', 'Admin Password')}: 123456</p>
                                    <p>
                                        {lang('您可以随时在设置界面中修改密码。', 'You can modify the password at any time on the settings page.')}
                                    </p>
                                </section>
                            </QueueAnim>
                        </div>
                    }
                </section >
                <section className="fs-initialize-step-action-wrapper">
                    {
                        this.state.currentStep > 0 &&
                        this.state.currentStep !== this.state.totalStep - 1 &&
                        this.state.currentStep !== this.state.totalStep - 2 &&
                        <Button className="fs-initialize-btn prev" size="small" title={lang('上一步', 'Previous Step')} onClick={this.prev.bind(this)}>
                            <ArrowButton />
                        </Button>
                    }
                    {
                        (this.state.currentStep === 0 || this.state.currentStep === 1 || this.state.currentStep === 2) &&
                        <Button className="fs-initialize-btn next" size="small" title={lang('下一步', 'Next Step')} onClick={this.next.bind(this)} loading={this.state.checking}>
                            {!this.state.checking && <ArrowButton directionRange={['right', 'left']} />}
                        </Button>
                    }
                    {
                        this.state.currentStep === this.state.totalStep - 1 &&
                        <Button className="fs-initialize-btn done" size="small" onClick={this.forwardLogin.bind(this)}>
                            <Icon type="check" style={{color: '#3bc374'}} /> {lang('开始使用', 'Start Using')}
                        </Button>
                    }
                </section >
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, initialize: {metadataServerIPs, storageServerIPs, clientIPs, managementServerIPs, enableHA, floatIPs, hbIPs, enableRAID}} = state;
    return {language, metadataServerIPs, storageServerIPs, clientIPs, managementServerIPs, enableHA, floatIPs, hbIPs, enableRAID};
};

const mapDispatchToProps = dispatch => {
    return {
        addIP: category => dispatch(initializeAction.addIP(category)),
        removeIP: (category, index) => dispatch(initializeAction.removeIP(category, index)),
        setIP: (category, index, ip) => dispatch(initializeAction.setIP(category, index, ip)),
        setEnableHA: enableHA => dispatch(initializeAction.setEnableHA(enableHA)),
        setEnableRAID: enableRAID => dispatch(initializeAction.setEnableRAID(enableRAID)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initialize);