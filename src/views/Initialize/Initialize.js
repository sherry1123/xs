import React, {Component} from 'react';
import {connect} from 'react-redux';
import update from "react-addons-update";
import {Button, Divider, Form, Icon, Input, message, Modal, notification, Popover, Progress, Steps, Switch} from 'antd';
import QueueAnim from 'rc-queue-anim';
import LanguageButton from '../../components/Language/LanguageButton';
import RecommendedRAID from '../../components/DiskConfiguration/RecommendedRAID';
import CustomRAID from '../../components/DiskConfiguration/CustomRAID';
import initializeAction from '../../redux/actions/initializeAction';
import lang from '../../components/Language/lang';
import {validateIpv4, /*KeyPressFilter, */lsGet, lsSet, lsRemove, ckGet} from '../../services';
import httpRequests from '../../http/requests';
import routerPath from '../routerPath';

class Initialize extends Component {
    constructor (props){
        super(props);
        // this.keyPressFilter = new KeyPressFilter();
        let {metadataServerIPs, storageServerIPs, clientIPs, managementServerIPs, floatIPs, hbIPs} = props;
        this.CheckIPResultCodeMap = {
            1: lang('该IP无法使用，请更换！', 'This IP can\'t be used, please change it.')
        };
        this.categoryArr = ['metadataServerIPs', 'storageServerIPs', 'clientIPs', 'managementServerIPs', 'floatIPs', 'hbIPs'];
        this.state = {
            // card step
            currentStep: 0,
            totalStep: 4,
            checking: false,
            // enable client input
            enableClient: true,
            // server IP input active
            activeInputMember: -1,
            // server IP input and corresponding verification result
            metadataServerIPsError: metadataServerIPs.map(() => ({status: '', help: ''})),
            storageServerIPsError: storageServerIPs.map(() => ({status: '', help: ''})),
            clientIPsError: clientIPs.map(() => ({status: '', help: ''})),
            managementServerIPsError: managementServerIPs.map(() => ({status: '', help: ''})),
            floatIPsError: floatIPs.map(() => ({status: '', help: ''})),
            hbIPsError: hbIPs.map(() => ({status: '', help: ''})),
            // current select service type
            currentServiceType: 'metadata',
            currentServiceNode: {
                type: 'metadata',
                ip: metadataServerIPs[0]
            },
            enableCustomRAID: false,
            // running initialization
            initStatusNum: 0,
            initProgressStep: 0,
            initProgress: 0,
            initInfoList: []
        };
    }

    componentWillMount (){
        // see router interceptor rule in routerPath.js
        let isDeInit = ckGet('deinit');
        let isInitialized = ckGet('init');
        if (isDeInit === 'true' && isInitialized === 'true'){
            this.props.history.replace(routerPath.DeInitializing);
        } else {
            let isRollingBack = ckGet('rollbacking');
            if (isRollingBack === 'true'){
                this.props.history.replace(routerPath.RollingBack);
            } else {
                let initStepLocal = lsGet('initStep');
                if (isInitialized === 'true' && isInitialized === 'true'){
                    if (!initStepLocal){
                        let isLoggedIn = ckGet('login');
                        let path = '';
                        if (!isLoggedIn || (isLoggedIn === 'false')){
                            path = routerPath.Login;
                        } else {
                            path = routerPath.Main + routerPath.Dashboard;
                        }
                        this.props.history.replace(path);
                    } else {
                        // isInitialized is true and there's a key 'initStep' in localStorage,
                        // it means initialization was finished but there was an abnormal exit or refresh
                        // action happened on browser before, should jump to the last initialization step
                        this.setState({currentStep: Number(initStepLocal) || this.state.totalStep});
                        // console.info('find initStep in localStorage, value is ' + initStepLocal);
                    }
                } else {
                    // for this case: isInitialized is false and there's a key 'initStep' in localStorage,
                    // it means initialization wasn't finished, so need to jump to the step recorded in localStorage
                    if (!!initStepLocal && initStepLocal > 2){
                        // get some state from localStorage then render them on view
                        let [{current = 0, total = 8}, initInfoList = []] = lsGet(['initStatus', 'initInfoList']);
                        let initProgress = (current / total).toFixed(2) * 100;
                        this.setState({
                            currentStep: Number(initStepLocal) || 3,
                            initProgress,
                            initInfoList
                        });
                    }
                }
            }
        }
    }

    componentWillReceiveProps (nextProps){
        let {initStatus: {current, total, status}} = nextProps;
        let {initProgressStep, initProgress, initInfoList} = this.state;
        initInfoList = [...initInfoList];
        if (current !== undefined){
            if (status === 0){
                // initialization is working properly
                if (current === total - 1){
                    // initialization finished
                    if (this.state.initProgressStep !== (total - 1)){
                        lsRemove('initInfoList');
                        this.clearProgressTime();
                        initInfoList.unshift({step: total - 1, initProgress: 100});
                        this.setState({
                            initStatusNum: 0,
                            initProgressStep: total - 1,
                            initProgress: 100,
                            initInfoList
                        });
                        // wait for server restart
                        let timer = setInterval(async () => {
                            try {
                                await httpRequests.syncUpSystemStatus();
                                clearInterval(timer);
                                await httpRequests.getDefaultUser();
                                this.setState({currentStep: 3});
                            } catch (e){
                                console.info(`Waiting for server restart, will try again 1s later ...`);
                            }
                        }, 1000);
                    }
                } else {
                    // initialization progress increase
                    let currentProgress = (current / total).toFixed(2) * 100;
                    if (current > initProgressStep){
                        this.allowIncrease = true;
                        initProgress = currentProgress;
                        initInfoList.unshift({step: current, initProgress});
                        this.setState({
                            initStatusNum: status,
                            initProgressStep: current,
                            initProgress,
                            initInfoList
                        });
                        lsSet('initInfoList', initInfoList);
                    } else if (current === initProgressStep){
                        this.allowIncrease = initProgress < (currentProgress + parseInt(100 / total, 10));
                    }
                }
            } else {
                // initialization is failed, status: -1
                this.allowIncrease = false;
                initInfoList.unshift({step: -1, initProgress: -1});
                this.setState({
                    initStatusNum: -1,
                    initInfoList
                });
                // clear the records in localStorage
                lsRemove(['initStep', 'initStatus', 'initInfoList']);
            }
        }
    }

    componentDidMount (){
        // httpRequests.getRecommendedRIAD(this.props.metadataServerIPs, this.props.storageServerIPs);
    }

    // step 1
    changeActiveInputMember (i){
        this.setState({activeInputMember: i});
    }

    setEnableClient (checked){
        this.setState({
            activeInputMember: this.state.activeInputMember === 4 ? 3 : this.state.activeInputMember,
            enableClient: checked
        });
    }

    async setEnableHA (checked){
        if (checked){
            await this.addIP('managementServerIPs');
            notification.open({
                message: lang('提示', 'Tooltip'),
                description: lang('您已为管理服务器启用HA，请配置两个有效的管理服务器IP及对应的连接有效性检测IP，并配置存储集群服务管理IP。这些设置将确保HA功能能够正常工作。',
                    `You have enabled HA for management server, please configure two valid management server IPs and corresponding heart beat IPs, 
                    also the storage cluster service management IP needs to be configured. All those settings will ensure that the HA function can work properly.`)
            });
        } else {
            await this.removeIP('managementServerIPs', 1);
        }
        await this.props.setEnableHA(checked);
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
            let help = !value ? lang('请输入IP', 'Please enter IP') : lang('无效的IP', 'Unavailable IP');
            await this.setErrorArr(category, i, {status: 'error', help});
        } else {
            // validate whether this ip is duplicated with an existing one in its server category
            let currentIPs = this.props[category];
            let duplicated = currentIPs.some((ip, index) => (ip === value && index !== i));
            if (duplicated){
                await this.setErrorArr(category, i, {status: 'error', help: lang('IP在该类型服务中已被使用', 'IP has already been used in this type of service')});
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
                        // console.info('清除', this.state.managementServerIPsError[i].status);
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

    // step 2
    setEnableRAID (checked){
        this.props.setEnableRAID(checked);
    }

    setCurrentServiceType (currentServiceType){
        // let ip = this.props[currentServiceType + 'ServerIPs'][0];
        // this.setState({currentServiceType, currentServiceNode: {type: currentServiceType, ip}});
        this.setState({currentServiceType});
    }

    setCurrentServiceNode (ip, i){
        if (this.state.currentServiceType !== 'management'){
            let currentServiceNode = {type: this.state.currentServiceType, ip, i};
            this.setState({currentServiceNode});
            // change recommended RAID configuration
            // console.info('change to:', this.state.currentServiceType, '  ip:', ip);
            this[(this.state.enableCustomRAID ? 'custom' : 'recommended') + 'RAIDWrapper'].getWrappedInstance().changeServiceIP(currentServiceNode);
        }
    }

    enableCustomRAID (){
        // switch to custom RAID mode
        let currentServiceNode = {
            type: 'metadata',
            ip: this.props.metadataServerIPs[0], // the first one
        };
        this.setState({
            enableCustomRAID: true,
            currentServiceType: 'metadata',
            currentServiceNode,
        });
    }

    async enableRecommendedRAID (){
        // switch to recommended RAID mode
        let currentServiceNode = {
            type: 'metadata',
            ip: this.props.metadataServerIPs[0], // the first one
        };
        await this.setState({
            enableCustomRAID: false,
            currentServiceType: 'metadata',
            currentServiceNode,
        });
        this.recommendedRAIDWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
    }

    enableCreateBuddyGroup (checked){
        this.props.setEnableCreateBuddyGroup(checked);
    }

    checkCustomRAID (){
        let {customRAID} = this.props;
        console.info(customRAID);
        // One node has at least one RAID conf, add disks into this RAID conf should check the RAID rule depends
        // on this RAID level, this validation has already done when user click apply button in CustomRAID component.
        // So, at here, we only need to check whether one RAID has no selected disks or not. If no, it means this
        // RAID conf isn't properly configured.
        let isCheckOK = Object.keys(customRAID).reduce((prev, curr) => prev && !customRAID[curr].some(node => node.raidList.some(raid => !raid.selectedDisks.length)), true);
        console.info(isCheckOK);
        return isCheckOK;
    }

    // step button
    prev (){
        lsRemove('initStep');
        this.setState({currentStep: this.state.currentStep - 1});
    }

    async next (){
        let next = this.state.currentStep + 1;
        lsSet('initStep', next);
        switch (next){
            case 1:
                await this.setState({checking: true});

                // validate basic pattern of all IPs
                await Promise.all(this.categoryArr.map(async category => {
                    let ips = this.props[category];
                    let len = ips.length;
                    for (let i = 0; i < len; i ++){
                        await this.validateIP(category, i, ips[i]);
                    }
                }));

                // validate HA related IPs if it enabled
                if (this.isNoError() && this.props.enableHA){
                    await this.validateIPForHA();
                    await this.validateNetworkSegmentForMgmtAndHAIPs();
                }

                // validate IP availability from HTTP server
                if (this.isNoError()){
                    // no local pattern error for all IPs
                    let {metadataServerIPs, storageServerIPs} = this.props;
                    let {result, metadataServerIPsError, storageServerIPsError} = await httpRequests.checkIPs({metadataServerIPs, storageServerIPs});
                    if (result){
                        // IP availability check successfully
                        await httpRequests.getRecommendedRIAD(this.props.metadataServerIPs, this.props.storageServerIPs);
                        this.setState({currentStep: next});
                    } else {
                        // IP availability check failed
                        // change help code to exact error description
                        metadataServerIPsError.forEach(error => !!error.status && (error.help = this.CheckIPResultCodeMap[error.help]));
                        storageServerIPsError.forEach(error => !!error.status && (error.help = this.CheckIPResultCodeMap[error.help]));
                        // show the error of each check failed IP
                        this.setState({
                            metadataServerIPsError,
                            storageServerIPsError
                        });
                        // give out tips
                        message.error(lang('经检测有IP不能正常使用，请更换', 'Some IPs seem can not be used properly through the validations，please replace them'));
                    }
                } else {
                    message.error(lang('IP输入验证没有通过，请先修正', 'IP input validation did not pass, please correct the error one(s) firstly'));
                }
                await this.setState({checking: false});
                break;
            case 2:
                if (this.state.enableCustomRAID && !this.checkCustomRAID()){
                    message.error(lang(
                        '您已开始自定义RAID配置，请正确配置所有元数据和存储服务所在节点的RAID，否则请选择使用推荐RAID配置。',
                        'You have enabled custom RAID configuration, please configure the RAIDs of nodes that all metadata and storage service run on. Otherwise please select the recommended RAID configuration.')
                    );
                } else {
                    Modal.confirm({
                        title: lang('提示', 'Prompt'),
                        content: <div style={{fontSize: 12}}>
                            {
                                this.props.enableCreateBuddyGroup ?
                                    <p>{lang(`您确定要在初始化期间创建Buddy Group吗？`, `Are you sure to create Buddy Group during initialization?`)}</p> :
                                    <p>{lang(`您确定不在初始化期间创建Buddy Group吗？您可以在系统初始化完成之后再创建。`, `Are you sure not to create Buddy Group during initialization? You can create it after system is initialized.`)}</p>
                            }
                        </div>,
                        iconType: 'exclamation-circle-o',
                        okType: 'primary',
                        okText: lang('确认', 'Confirm'),
                        cancelText: lang('取消', 'Cancel'),
                        onOk: async () => {
                            this.setState({currentStep: next});
                            // this.startInitialization();
                        },
                        onCancel: () => {

                        }
                    });
                }
                break;
            default:
                break;
        }
    }

    startInitialization (){
        this.setState({initInfoList: [{step: 0, initProgress: 0}]});
        let {metadataServerIPs, storageServerIPs, clientIPs, managementServerIPs, enableHA, floatIPs, hbIPs, enableRAID, recommendedRAID, customRAID, enableCreateBuddyGroup} = this.props;
        httpRequests.startInitialization({
            // service and client IPs
            metadataServerIPs,
            storageServerIPs,
            managementServerIPs,
            clientIPs,
            // HA
            enableHA,
            floatIPs,
            hbIPs,
            // RAID
            enableRAID,
            enableCustomRAID: this.state.enableCustomRAID,
            recommendedRAID,
            customRAID,
            // buddy group
            enableCreateBuddyGroup,
        });
        this.setProgressTimer();
    }

    setProgressTimer (){
        if (!this.progressTimer){
            this.progressTimer = setInterval(() => {
                if (this.allowIncrease){
                    let initProgress = this.state.initProgress + 1;
                    this.setState({
                        initProgress: initProgress > 100 ? 100 : initProgress
                    });
                }
            }, 1000);
        }
    }

    clearProgressTime (){
        this.progressTimer && window.clearInterval(this.progressTimer);
    }

    forwardLogin (){
        // fetch API to create user and set password

        lsRemove(['initStep', 'initStatus', 'initInfoList']);
        this.props.history.push({
            pathname: routerPath.Login,
            state: {
                fromInit: true
            }
        });
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0, placement: 'top'};
        let initTipsMap = {
            '-1': lang('初始化失败，请联系运维人员寻求帮助！', 'Initialization failed, please ask operation and maintenance staff for help!'),
            0: lang('初始化已开始，请稍候', 'Initializing, pleas wait for a moment'),
            1: lang('正在初始化管理服务器', 'Initializing management server'),
            2: lang('正在初始化元数据服务器', 'Initializing metadata server'),
            3: lang('正在初始化存储服务器', 'Initializing storage server'),
            4: lang('正在初始化客户端', 'Initializing client'),
            5: lang('正在初始化数据库', 'Initializing database'),
            6: lang('正在保存初始化配置', 'Saving initialization config'),
            7: lang('初始化完成！', 'Initialization finished！'),
        };
        return (
            <section className="fs-initialize-wrapper">
                <div>
                    {Object.keys(Array.apply(null, {length: 6})).map(i => (
                        <i className={`fs-initialize-background-stone b-${parseInt(i, 10) + 1}`} key={i}>
                            <i className="fs-sand" />
                            <i className="fs-earth-layer">
                                <i className="fs-satellite" />
                            </i>
                            <i className="fs-moon-layer">
                                <i className="fs-satellite" />
                            </i>
                            <i className="fs-mercury-layer">
                                <i className="fs-satellite" />
                            </i>
                        </i>
                    ))}
                </div>
                <section className="fs-initialize-language-btn-wrapper">
                    <LanguageButton pureText />
                </section>
                <section className="fs-initialize-title-wrapper">
                    {lang('OrcaFS初始化向导', 'OrcaFS Initialization Wizard')}
                </section>
                <section className="fs-initialize-welcome-wrapper">
                    {lang(
                        '欢迎进入OrcaFS初始化向导！您将通过以下步骤初始化您的存储集群：',
                        'Welcome to the OrcaFS initialization wizard! Just follow these steps below to initialize your storage cluster: '
                    )}
                </section>
                <Steps className="fs-initialize-step-index-wrapper" size="small" key="initialize-step" current={this.state.currentStep}>
                    <Steps.Step title={lang('定义角色', 'Define Roles')} icon={<Icon type="user" />} />
                    <Steps.Step title={lang('确认配置', 'Confirm Configuration')} icon={<Icon type="hdd" />} />
                    <Steps.Step title={lang('初始化', 'Initialization')} icon={this.state.currentStep === 2 ? <Icon type="loading" /> : <Icon type="setting" />} />
                    <Steps.Step title={lang('完成', 'Complete')} icon={<Icon type="smile-o" />} />
                </Steps>
                <section className="fs-initialize-step-content-wrapper">
                    {
                        this.state.currentStep === 0 &&
                        <div className="fs-initialize-step-content">
                            <section className="fs-step-title">
                                {lang(
                                    '步骤1 - 定义角色：请定义存储集群中各类型服务所在节点的IP和客户端IP(可选)。',
                                    'Step1 - define roles: Please define the various types of services of node IP and the clients IP(optional) of the storage cluster.'
                                )}
                                <span style={{float: 'right'}} >
                                    {lang('配置客户端', 'Configure Client')}
                                    <Switch style={{marginLeft: 10}} size="small" checked={this.state.enableClient} onChange={this.setEnableClient.bind(this)} />
                                </span>
                            </section>
                            <Divider className="fs-initialize-divider-wrapper" dashed />
                            <div className="fs-ip-input-group">
                                <section key="ip-input-1" className={`fs-ip-input-member ${this.state.activeInputMember === 1 ? 'active' : ''}`} onClick={this.changeActiveInputMember.bind(this, 1)}>
                                    <div className="fs-ip-input-title">
                                        <Popover
                                            {...buttonPopoverConf}
                                            content={lang('元数据服务器允许配置1至N个', 'Allow 1 to N metadata servers to be configured')}
                                        >
                                            <span>{lang('元数据服务', 'Metadata Servers')}</span>
                                        </Popover>
                                        <Icon className="fs-ip-plus" type="plus" onClick={this.addIP.bind(this, 'metadataServerIPs')} />
                                    </div>
                                    <QueueAnim type={['right', 'left']}>
                                        {this.props.metadataServerIPs.map((ip, i) =>
                                            <Form.Item
                                                className="fs-ip-input-item"
                                                key={`metadata-servers-${i}`}
                                                validateStatus={this.state['metadataServerIPsError'][i].status}
                                                help={this.state['metadataServerIPsError'][i].help}
                                            >
                                                <Input
                                                    className="fs-ip-input"
                                                    size="small"
                                                    placeholder={lang('请输入IP', 'please enter IP')}
                                                    value={ip}
                                                    onChange={({target: {value}}) => {
                                                        this.setIP.bind(this, 'metadataServerIPs', i, value)();
                                                        this.validateIP.bind(this, 'metadataServerIPs', i, value)();
                                                    }}
                                                />
                                                {i !== 0 &&
                                                    <Icon
                                                        className="fs-ip-minus"
                                                        type="minus"
                                                        title={lang('移除', 'remove')}
                                                        onClick={this.removeIP.bind(this, 'metadataServerIPs', i)}
                                                    />
                                                }
                                            </Form.Item>)
                                        }
                                    </QueueAnim>
                                </section>
                                <section key="ip-input-2" className={`fs-ip-input-member ${this.state.activeInputMember === 2 ? 'active' : ''}`} onClick={this.changeActiveInputMember.bind(this, 2)}>
                                    <div className="fs-ip-input-title">
                                        <Popover
                                            {...buttonPopoverConf}
                                            content={lang('存储服务器允许配置1至N个', 'Allow 1 to N storage servers to be configured')}
                                        >
                                            <span>{lang('存储服务', 'Storage Servers')}</span>
                                        </Popover>
                                        <Icon className="fs-ip-plus" type="plus" onClick={this.addIP.bind(this, 'storageServerIPs')} />
                                    </div>
                                    <QueueAnim type={['right', 'left']}>
                                        {this.props.storageServerIPs.map((ip, i) =>
                                            <Form.Item
                                                className="fs-ip-input-item"
                                                key={`storage-servers-${i}`}
                                                validateStatus={this.state['storageServerIPsError'][i].status}
                                                help={this.state['storageServerIPsError'][i].help}
                                            >
                                                <Input
                                                    className="fs-ip-input"
                                                    size="small"
                                                    placeholder={lang('请输入IP', 'please enter IP')}
                                                    value={ip}
                                                    onChange={({target: {value}}) => {
                                                        this.setIP.bind(this, 'storageServerIPs', i, value)();
                                                        this.validateIP.bind(this, 'storageServerIPs', i, value)();
                                                    }}
                                                />
                                                {i !== 0 &&
                                                    <Icon
                                                        className="fs-ip-minus"
                                                        title={lang('移除', 'remove')}
                                                        type="minus"
                                                        onClick={this.removeIP.bind(this, 'storageServerIPs', i)}
                                                    />
                                                }
                                            </Form.Item>)
                                        }
                                    </QueueAnim>
                                </section>
                                <section key="ip-input-3" className={`fs-ip-input-member ${this.state.activeInputMember === 3 ? 'active' : ''}`} onClick={this.changeActiveInputMember.bind(this, 3)}>
                                    <div className="fs-ip-input-title">
                                        <Popover
                                            {...buttonPopoverConf}
                                            content={lang('管理服务器允许配置1至2个', 'Allow 1 to 2 management servers to be configured')}
                                        >
                                            <span>{lang('管理服务', 'Management Server')}</span>
                                        </Popover>
                                    </div>
                                    <QueueAnim type={['right', 'left']}>
                                        {this.props.managementServerIPs.map((ip, i) =>
                                            <Form.Item
                                                className="fs-ip-input-item"
                                                key={`management-server-${i}`}
                                                validateStatus={this.state['managementServerIPsError'][i].status}
                                                help={this.state['managementServerIPsError'][i].help}
                                            >
                                                <Input
                                                    className="fs-ip-input no-margin"
                                                    size="small"
                                                    addonBefore={this.props.enableHA ? lang(`节点${i + 1}`, `Node ${i + 1}`) : ''}
                                                    placeholder={lang('请输入IP', 'please enter IP')}
                                                    value={ip}
                                                    onChange={({target: {value}}) => {
                                                        this.setIP.bind(this, 'managementServerIPs', i, value)();
                                                        this.validateIP.bind(this, 'managementServerIPs', i, value)();
                                                    }}
                                                />
                                            </Form.Item>)
                                        }
                                    </QueueAnim>
                                    <Divider dashed style={{margin: "12px 0"}} />
                                    <div className="fs-ip-input-item">
                                        <label className="fs-enable-ha-label">{lang('为管理服务启用HA', 'Enable HA for Mgmt Server')}</label>
                                        <Switch
                                            size="small"
                                            style={{float: 'right', marginTop: 3}}
                                            title={this.props.enableHA ? lang('点击不启用', 'Click to disabled') : lang('点击开启', 'Click to enable')}
                                            checked={this.props.enableHA}
                                            onChange={this.setEnableHA.bind(this)}
                                        />
                                    </div>
                                    <Divider dashed style={{margin: "12px 0"}} />
                                    {this.props.enableHA &&
                                        <div>
                                            {this.props.floatIPs.map((ip, i) =>
                                                <Form.Item
                                                    className="fs-ip-input-item"
                                                    key={`float-${i}`}
                                                    label={i === 0 ? lang('存储集群服务管理IP', 'Cluster Service Mgmt IP') : null}
                                                    validateStatus={this.state['floatIPsError'][i].status}
                                                    help={this.state['floatIPsError'][i].help}
                                                >
                                                    <Input
                                                        className="fs-ip-input no-margin"
                                                        size="small"
                                                        placeholder={lang('请输入存储服务器集群管理IP', 'please enter cluster service management IP')}
                                                        addonAfter={
                                                            <Popover
                                                                {...buttonPopoverConf}
                                                                content={lang(`该IP首次将默认映射至管理服务所在节点${i + 1}的IP上`, `This IP will be mapped to the IP of management server Node ${i + 1} firstly by default`)}
                                                            >
                                                                <Icon type="question-circle-o" className="fs-info-icon" />
                                                            </Popover>
                                                        }
                                                        value={ip}
                                                        onChange={({target: {value}}) => {
                                                            this.setIP.bind(this, 'floatIPs', i, value)();
                                                            this.validateIP.bind(this, 'floatIPs', i, value)();
                                                        }}
                                                    />
                                                </Form.Item>)
                                            }
                                            {this.props.hbIPs.map((ip, i) =>
                                                <Form.Item className="fs-ip-input-item" key={`hb-${i}`}
                                                    label={i === 0 ? lang('连接有效性检测IP', 'Connect validity check IP') : null}
                                                    validateStatus={this.state['hbIPsError'][i].status}
                                                    help={this.state['hbIPsError'][i].help}
                                                >
                                                    <Input
                                                        className="fs-ip-input no-margin"
                                                        size="small"
                                                        addonBefore={this.props.enableHA ? lang(`节点${i + 1}`, `Node ${i + 1}`) : ''}
                                                        placeholder={lang('请输入HB IP', 'please enter HB IP')}
                                                        addonAfter={
                                                            <Popover
                                                                {...buttonPopoverConf}
                                                                content={
                                                                    lang(`对应管理服务所在节点${i + 1}，不能与管理服务所在节点处于同一网段`,
                                                                    `Corresponding with management server Node ${i + 1}, can't be in the same network segment with management servers`)
                                                                }
                                                            >
                                                                <Icon type="question-circle-o" className="fs-info-icon" />
                                                            </Popover>
                                                        }
                                                        value={ip}
                                                        onChange={({target: {value}}) => {
                                                            this.setIP.bind(this, 'hbIPs', i, value)();
                                                            this.validateIP.bind(this, 'hbIPs', i, value)();
                                                        }}
                                                    />
                                                </Form.Item>)
                                            }
                                        </div>
                                    }
                                </section>
                                {this.state.enableClient &&
                                    <section key="ip-input-4" className={`fs-ip-input-member ${this.state.activeInputMember === 4 ? 'active' : ''}`} onClick={this.changeActiveInputMember.bind(this, 4)}>
                                        <div className="fs-ip-input-title">
                                            <Popover
                                                {...buttonPopoverConf}
                                                content={lang('客户端允许配置0至N个', 'Allow 0 to N clients to be configured')}
                                            >
                                                <span>{lang('客户端', 'Clients')}</span>
                                            </Popover>
                                            <Icon className="fs-ip-plus" type="plus" onClick={this.addIP.bind(this, 'clientIPs')} />
                                        </div>
                                        <QueueAnim type={['right', 'left']}>
                                            {this.props.clientIPs.map((ip, i) =>
                                                <Form.Item
                                                    className="fs-ip-input-item"
                                                    key={`clients-${i}`}
                                                    validateStatus={this.state['clientIPsError'][i].status}
                                                    help={this.state['clientIPsError'][i].help}
                                                >
                                                    <Input
                                                        className="fs-ip-input"
                                                        size="small"
                                                        placeholder={lang('请输入IP', 'please enter IP')}
                                                        value={ip}
                                                        onChange={({target: {value}}) => {
                                                            this.setIP.bind(this, 'clientIPs', i, value)();
                                                            this.validateIP.bind(this, 'clientIPs', i, value)();
                                                        }}
                                                    />
                                                    {i !== 0 &&
                                                        <Icon
                                                            className="fs-ip-minus"
                                                            title={lang('移除', 'remove')}
                                                            type="minus"
                                                            onClick={this.removeIP.bind(this, 'clientIPs', i)}
                                                        />
                                                    }
                                                </Form.Item>)
                                            }
                                        </QueueAnim>
                                    </section>
                                }
                            </div>
                        </div>
                    }
                    {
                        this.state.currentStep === 1 &&
                        <div className="fs-initialize-step-content">
                            <section className="fs-step-title">
                                {lang(
                                    '步骤2 - 确认配置：请确定您输入的各类型服务所在节点的IP是正确的，并确认推荐给您的RAID配置是否符合需求，若不符合您可自定义。并决定是否在系统初始化期间创建Buddy Group。',
                                    'Step2 - confirm configuration: Please confirm the IP of nodes which have various services run on, and also the recommended RAID configuration, if not match your needs can custom it. And decide whether to create Buddy Group during system initialization or not.'
                                )}
                            </section>
                            <Divider className="fs-initialize-divider-wrapper" dashed />
                            <section className="fs-confirm-conf-wrapper">
                                <section className="fs-service-ip-wrapper">
                                    <section className="fs-type-wrapper">
                                        <div className={`fs-type-item ${this.state.currentServiceType === 'metadata' ? 'active' : ''}`} onClick={this.setCurrentServiceType.bind(this, 'metadata')}>
                                            <Icon type="profile" />{lang('元数据服务', 'Metadata')}
                                        </div>
                                        <div className={`fs-type-item ${this.state.currentServiceType === 'storage' ? 'active' : ''}`} onClick={this.setCurrentServiceType.bind(this, 'storage')}>
                                            <Icon type="database" />{lang('存储服务', 'Storage')}
                                        </div>
                                        <div className={`fs-type-item ${this.state.currentServiceType === 'management' ? 'active' : ''}`} onClick={this.setCurrentServiceType.bind(this, 'management')}>
                                            <Icon type="laptop" />{lang('管理服务', 'Management')}
                                        </div>
                                    </section>
                                    <section className="fs-ip-wrapper">
                                        {this.props[this.state.currentServiceType + 'ServerIPs'].map((ip, i) => (
                                            <div
                                                className={`
                                                    fs-ip-item
                                                    ${this.state.currentServiceType === 'management' ? 'no-hover' : ''}
                                                    ${(ip === this.state.currentServiceNode.ip && this.state.currentServiceType === this.state.currentServiceNode.type) ? 'active' : ''}
                                                `}
                                                key={i}
                                                onClick={this.setCurrentServiceNode.bind(this, ip, i)}
                                            >
                                                {ip}
                                            </div>
                                        ))}
                                    </section>
                                </section>
                                {
                                    !this.state.enableCustomRAID ?
                                        <RecommendedRAID
                                            ref={ref => this.recommendedRAIDWrapper = ref}
                                            enableCustomRAID={this.enableCustomRAID.bind(this)}
                                        /> :
                                        <CustomRAID
                                            enableRecommendedRAID={this.enableRecommendedRAID.bind(this)}
                                        />
                                }
                                <section className="fs-buddy-group-wrapper">
                                    {lang('Buddy Group', 'Buddy Group')}
                                    <Switch
                                        style={{margin: '0 15px'}}
                                        size="small"
                                        value={this.props.enableCreateBuddyGroup}
                                        onChange={this.enableCreateBuddyGroup.bind(this)}
                                    />
                                    {this.props.enableCreateBuddyGroup ? lang('创建', 'Create') : lang('不创建', 'Not Create')}
                                    <Popover
                                        {...buttonPopoverConf}
                                        content={lang(
                                            '如果您在这里不开启创建Buddy Group，在系统初始化期间将不会创建Buddy Group。您可以在系统初始化成功后登录到业务界面再进行创建。',
                                            'If you don\'t enable create Buddy Group here, it will not create Buddy Group during system initialization. And you can login to the business page to do create Buddy Group operation after the system is initialized successfully.')
                                        }
                                    >
                                        <Icon type="question-circle-o" className="fs-info-icon m-l" />
                                    </Popover>
                                </section>
                            </section>
                        </div>
                    }
                    {
                        this.state.currentStep === 2 &&
                        <div className="fs-initialize-step-content">
                            <section className="fs-step-title">
                                {lang(
                                    '步骤3 - 初始化：初始化已经开始！请保持相关设备的网络畅通，请勿关闭电源。',
                                    'Step3 - initialization: Initialization has just begun! Please keep the equipment network unblocked, do not turn off the power supply.'
                                )}
                            </section>
                            <Progress
                                className="fs-initialization-progress-bar"
                                showInfo={false}
                                percent={this.state.initProgress}
                                status={this.state.initStatusNum === 0 ? (this.state.initProgress === 100 ? 'success' : 'active') : 'exception'}
                                strokeWidth={15}
                            />
                            <section className="fs-initialization-wrapper">
                                {
                                    this.state.initInfoList.map((info, i) => info.step === -1 ?
                                        <p className="fs-initialization-info failed" key={i}>
                                            {initTipsMap[-1]}
                                        </p> :
                                        <p className="fs-initialization-info" key={i}>
                                            {lang('完成百分比：', 'Completion percentage: ') + info.initProgress + '%, ' + initTipsMap[info.step]}
                                        </p>)
                                }
                            </section>
                        </div>
                    }
                    {
                        this.state.currentStep === 3 &&
                        <div className="fs-initialize-step-content">
                            <section className="fs-step-title">
                                <p>
                                    {lang(
                                        '步骤4 - 完成：初始化已完成，您的存储集群已经准备好了!',
                                        'Step4 - finished: The initialization is complete and your storage cluster is ready!'
                                    )}
                                </p>
                            </section>
                            <section key="fs-initialized-2" className="fs-done-wrapper">
                                <p>
                                    {lang(
                                        '以下是为您生成的管理员账号及初始密码，请点击下方的"开始使用"按钮并通过该账号进行登录: ',
                                        'The following is a administration account that generated for you, please click the "Start Using" button and do login through this account: '
                                    )}
                                </p>
                                <p>{lang('帐号', 'Account')}: {this.props.defaultUser.username}</p>
                                <p>{lang('密码', 'Password')}: {this.props.defaultUser.password}</p>
                                <p>
                                    <Icon style={{color: '#52a7fe'}} type="info-circle-o" /> {lang('出于账号安全的考虑，建议您在登录后立即点击右上方用户信息进行密码修改。', 'Consider to the security of account, we suggest you to click the user information at top-right region of the screen to change the password immediately after login.')}
                                </p>
                            </section>
                        </div>
                    }
                </section >
                <section className="fs-initialize-step-action-wrapper">
                    {
                        this.state.currentStep > 0 &&
                        this.state.currentStep !== this.state.totalStep - 2 &&
                        this.state.currentStep !== this.state.totalStep - 1 &&
                        <Button
                            size="small"
                            type="primary"
                            onClick={this.prev.bind(this)}
                        >
                            {lang('上一步', 'Previous')}
                        </Button>
                    }
                    {
                        (this.state.currentStep === 0 || this.state.currentStep === 1) &&
                        <Button
                            size="small"
                            type="primary"
                            style={{marginLeft: this.state.currentStep !== 0 ? 10 : 0}}
                            onClick={this.next.bind(this)} loading={this.state.checking}
                        >
                            {!this.state.checking && <span>{lang('下一步', 'Next')}</span>}
                        </Button>
                    }
                    {
                        this.state.currentStep === this.state.totalStep - 1 &&
                        <Button
                            size="small"
                            type="primary"
                            onClick={this.forwardLogin.bind(this)}
                        >
                            {lang('开始使用', 'Start Using')}
                        </Button>
                    }
                </section >
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, initialize: {metadataServerIPs, storageServerIPs, clientIPs, managementServerIPs, enableHA, floatIPs, hbIPs, enableRAID, enableCreateBuddyGroup, initStatus, defaultUser, recommendedRAID, customRAID}} = state;
    return {language, metadataServerIPs, storageServerIPs, clientIPs, managementServerIPs, enableHA, floatIPs, hbIPs, enableRAID, enableCreateBuddyGroup, initStatus, defaultUser, recommendedRAID, customRAID};
};

const mapDispatchToProps = dispatch => {
    return {
        addIP: category => dispatch(initializeAction.addIP(category)),
        removeIP: (category, index) => dispatch(initializeAction.removeIP(category, index)),
        setIP: (category, index, ip) => dispatch(initializeAction.setIP(category, index, ip)),
        setEnableHA: enableHA => dispatch(initializeAction.setEnableHA(enableHA)),
        setEnableRAID: enableRAID => dispatch(initializeAction.setEnableRAID(enableRAID)),
        setEnableCreateBuddyGroup: enableCreateBuddyGroup => dispatch(initializeAction.setEnableCreateBuddyGroup(enableCreateBuddyGroup)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initialize);