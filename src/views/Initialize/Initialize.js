import React, {Component} from 'react';
import {connect} from 'react-redux';
import update from "react-addons-update";
import {Button, Divider, Form, Icon, Input, Progress, message, Steps, Tooltip} from 'antd';
import QueueAnim from 'rc-queue-anim';
import initializeAction from '../../redux/actions/initializeAction';
import LanguageButton from '../../components/Language/LanguageButton';
import lang from '../../components/Language/lang';
import {validateIpv4} from '../../services';
import Cookie from 'js-cookie';
import routerPath from '../routerPath';

class Initialize extends Component {
    constructor (props){
        super(props);
        let {metadataServerIPs, storageServerIPs, managementServerIPs, floatIPs} = props;
        this.categoryArr = ['metadataServerIPs', 'storageServerIPs', 'managementServerIPs'];
        this.state = {
            current: 0,
            stepNum: 4,

            metadataServerIPsError: metadataServerIPs.map(() => ({status: '', help: ''})),
            storageServerIPsError: storageServerIPs.map(() => ({status: '', help: ''})),
            managementServerIPsError: managementServerIPs.map(() => ({status: '', help: ''})),
            floatIPsError: floatIPs.map(() => ({status: '', help: ''})),

            initProgress: 0,
            initializationInfo: [lang('安装已开始，请稍候...', 'Initialization started, pleas wait for moment...')]
        };
    }

    componentWillMount (){
        let isInitialized = Cookie.get('init');
        if (isInitialized === 'true'){
            let isLoggedIn = Cookie.get('user');
            let path = '';
            if (!isLoggedIn || (isLoggedIn === 'false')){
                path = routerPath.Login;
            } else {
                path = routerPath.Main + routerPath.MetadataNodesOverview;
            }
            this.props.history.replace(path);
        }
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
        let errorArr = Object.assign([], this.state[category + 'Error']);
        errorArr.splice(i, 1);
        await this.setErrorArr(category, i, 'remove');
    }

    setIP (category, i, value){
        this.props.setIP(category, i, value);
    }

    async setErrorArr (category, i, errorObj){
        // 在state中修改嵌套数组或者对象很沉重，可移到redux里面进行维护
        let newState;
        let mutation = errorObj === 'remove' ? [i, 1] : [i, 1, errorObj];
        switch (category){
            case 'metadataServerIPs':
                newState = update(this.state, {metadataServerIPsError: {$splice: [mutation]}});
                break;
            case 'storageServerIPs':
                newState = update(this.state, {storageServerIPsError: {$splice: [mutation]}});
                break;
            case 'managementServerIPs':
                newState = update(this.state, {managementServerIPsError: {$splice: [mutation]}});
                break;
            default:
                break;
        }
        await this.setState(Object.assign(this.state, newState));
    }

    async validateIP (category, i, value) {
        // validate ipv4 address pattern
        if (!validateIpv4(value)){
            let help = !value ? lang('请输入IP', 'please input IP') : lang('IP格式错误', 'pattern error');
            await this.setErrorArr(category, i, {status: 'error', help});
        } else {
            // validate whether this ip is duplicated with an existing one in its server category
            let currentIPs = this.props[category];
            let duplicated = currentIPs.some((ip, index) => (ip === value && index !== i));
            if (duplicated){
                await this.setErrorArr(category, i, {status: 'error', help: lang('IP在所在分类中有重复', 'duplicated')});
            } else {
                // validate successfully
                await this.setErrorArr(category, i, {status: '', help: ''});
            }
        }
    }

    prev (){
        this.setState({current: this.state.current - 1});
    }

    next (){
        let next = this.state.current + 1;
        switch (next) {
            case 1:
                // validate all ips before entering information confirm step
                this.categoryArr.forEach(category => {
                    let ips = this.props[category];
                    ips.forEach(async (ip, i) => {
                        await this.validateIP(category, i, ip);
                    });
                });
                // is there a validation error
                let validated = true;
                for (let category of this.categoryArr) {
                    let errors = this.state[category + 'Error'];
                    for (let error of errors) {
                        if (error.help && error.status) {
                            validated = false;
                            break;
                        }
                    }
                }
                validated ?
                    this.setState({current: next}) :
                    message.error(lang('IP输入有误，请先修正', 'Something is wrong with IP input, please correct it first'));
                break;
            case 2:
                this.setState({current: next});
                this.startInitialization();
                break;
            case 3:
                break;
            default:
                break;
        }
    }

    startInitialization (){
        let initProgress = this.state.initProgress;
        let initTimer = setInterval(async () => {
            initProgress += (initProgress === 10 || initProgress === 40 || initProgress === 70 ? 10 : 1);
            let info = `initialize xxx file, ${lang('进度:', 'progress:')} ${initProgress}%`;
            let infoArr = initProgress === 100 ? [info, lang('初始化已完成!', 'Initialization done!')] : [info];
            let newState =  update(this.state, {
                initializationInfo: {$push: infoArr},
                initProgress: {$set: initProgress}
            });
            await this.setState(Object.assign(this.state, newState));
            let list = this.initInfoWrapper;
            list && (list.scrollTop = list.scrollHeight);
            if (initProgress === 100){
                clearInterval(initTimer);
                setTimeout(() => this.setState({current: 3}), 1500);
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
                <section className="fs-initialize-language-btn-wrapper">
                    <LanguageButton />
                </section>
                <section key="initialize-title" className="fs-initialize-welcome-wrapper">
                    {lang(
                        '欢迎进入OrcaFS初始化向导。您将通过以下步骤初始化您的存储集群：',
                        'Welcome to the OrcaFS initialization wizard. You will initialize your storage cluster just follow the steps below: '
                    )}
                </section>
                <Steps key="initialize-step" className="fs-initialize-step-index-wrapper" current={this.state.current}>
                    <Steps.Step title={lang('定义角色', 'Define Roles')} />
                    <Steps.Step title={lang('信息确认', 'Information Confirm')} />
                    <Steps.Step title={lang('开始初始化', 'Start Initialization')} />
                    <Steps.Step title={lang('完成', 'Completed')} />
                </Steps>
                <Divider className="fs-initialize-divider-wrapper" dashed />
                <section className="fs-initialize-step-content-wrapper">
                    {
                        this.state.current === 0 &&
                        <Form className="fs-initialize-step-content">
                            <QueueAnim type="top">
                                <section key="ip-input-title" className="fs-ip-input-title">
                                    {lang(
                                        '步骤1：请定义将作为元数据服务器、存储服务器以及管理服务器的管理主机的IP，以及为高可用性实现提供的一个浮动IP。运行admon守护进程管理主机的默认值是相同的IP。',
                                        'Step1: Please define the management IP of the hosts which shall act as metadata servers, storage servers and management servers. And the float IP for HA implementation. The default value for the management daemon is the same IP, which runs the admon daemon.'
                                    )}
                                </section>
                            </QueueAnim>
                            <div className="fs-ip-input-group">
                                <QueueAnim>
                                    <section key="ip-input-1" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">
                                            <Tooltip placement="top" title={lang('元数据服务器允许0至n个', 'There are 0 to n metadata servers allowed')}>
                                                {lang('元数据服务器', 'Metadata Servers')}
                                            </Tooltip>
                                        </Divider>
                                        <QueueAnim type={['right', 'left']}>
                                            {this.props.metadataServerIPs.map((ip, i) =>
                                                <Form.Item className="fs-ip-input-item" key={`metadata-servers-${i}`}
                                                    validateStatus={this.state['metadataServerIPsError'][i].status}
                                                    help={this.state['metadataServerIPsError'][i].help}
                                                >
                                                    <Input className="fs-ip-input" value={ip}
                                                        onChange={({target: {value}}) => {
                                                            this.setIP.bind(this, 'metadataServerIPs', i, value)();
                                                            this.validateIP.bind(this, 'metadataServerIPs', i, value)();
                                                        }}
                                                        addonAfter={
                                                            <Button title={lang('移除', 'remove')} icon="minus" size="small"
                                                                onClick={this.removeIP.bind(this, 'metadataServerIPs', i)} />
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
                                            <Tooltip placement="top" title={lang('存储服务器允许0至n个', 'There are 0 to n storage servers allowed')}>
                                                {lang('存储服务器', 'Storage Servers')}
                                            </Tooltip>
                                        </Divider>
                                        <QueueAnim type={['right', 'left']}>
                                            {this.props.storageServerIPs.map((ip, i) =>
                                                <Form.Item className="fs-ip-input-item" key={`storage-servers-${i}`}
                                                    validateStatus={this.state['storageServerIPsError'][i].status}
                                                    help={this.state['storageServerIPsError'][i].help}
                                                >
                                                    <Input className="fs-ip-input" value={ip}
                                                        onChange={({target: {value}}) => {
                                                           this.setIP.bind(this, 'storageServerIPs', i, value)();
                                                           this.validateIP.bind(this, 'storageServerIPs', i, value)();
                                                        }}
                                                        addonAfter={
                                                            <Button title={lang('移除', 'remove')} icon="minus" size="small"
                                                                onClick={this.removeIP.bind(this, 'storageServerIPs', i)} />
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
                                            <Tooltip placement="top" title={lang('管理服务器节点允许1至2个', 'There are 1 to 2 management servers allowed')}>
                                                {lang('管理服务器', 'Management Server')}
                                            </Tooltip>
                                        </Divider>
                                        <QueueAnim type={['right', 'left']}>
                                            {this.props.managementServerIPs.map((ip, i) =>
                                                <Form.Item className="fs-ip-input-item" key={`client-${i}`}
                                                    validateStatus={this.state['managementServerIPsError'][i].status}
                                                    help={this.state['managementServerIPsError'][i].help}
                                                >
                                                    <Input className="fs-ip-input" value={ip}
                                                        onChange={({target: {value}}) => {
                                                            this.setIP.bind(this, 'managementServerIPs', i, value)();
                                                            this.validateIP.bind(this, 'managementServerIPs', i, value)();
                                                        }}
                                                        addonAfter={
                                                            <Button title={lang('移除', 'remove')} icon="minus" size="small"
                                                                onClick={this.removeIP.bind(this, 'managementServerIPs', i)}/>
                                                        }
                                                    />
                                                </Form.Item>)
                                            }
                                            {this.props.managementServerIPs.length < 2 &&
                                                <Button className="fs-ip-plus-btn" title={lang('添加', 'add')} icon="plus" size="small"
                                                    onClick={this.addIP.bind(this, 'managementServerIPs')} />}
                                        </QueueAnim>
                                    </section>
                                    <section key="ip-input-4" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">
                                            <Tooltip placement="top" title={lang('浮动IP允许1个', 'There is 1 float IP allowed')}>
                                                {lang('浮动IP', 'Float IP')}
                                            </Tooltip>
                                        </Divider>
                                        <QueueAnim type={['right', 'left']}>
                                            {this.props.floatIPs.map((ip, i) =>
                                                <Form.Item className="fs-ip-input-item" key={`client-${i}`}
                                                    validateStatus={this.state['floatIPsError'][i].status}
                                                    help={this.state['floatIPsError'][i].help}
                                                >
                                                    <Input className="fs-ip-input" value={ip}
                                                        onChange={({target: {value}}) => {
                                                            this.setIP.bind(this, 'floatIPs', i, value)();
                                                            this.validateIP.bind(this, 'floatIPs', i, value)();
                                                        }}
                                                    />
                                                </Form.Item>)
                                            }
                                        </QueueAnim>
                                    </section>
                                </QueueAnim>
                            </div>
                        </Form>
                    }
                    {
                        this.state.current === 1 &&
                        <div className="fs-initialize-step-content">
                            <QueueAnim type="top">
                                <section className="fs-ip-input-title">
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
                                            <Form.Item className="fs-ip-input-item" key={i}>
                                                <span>{ip}</span>
                                            </Form.Item>)
                                        }
                                    </section>
                                    <section key="ip-confirm-2" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">{lang('存储服务器', 'Storage Servers')}</Divider>
                                        {this.props.storageServerIPs.map((ip, i) =>
                                            <Form.Item className="fs-ip-input-item" key={i}>
                                                <span>{ip}</span>
                                            </Form.Item>)
                                        }
                                    </section>
                                    <section key="ip-confirm-3" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">{lang('管理服务器', 'Mangement Server')}</Divider>
                                        {this.props.managementServerIPs.map((ip, i) =>
                                            <Form.Item className="fs-ip-input-item" key={i}>
                                                <span>{ip}</span>
                                            </Form.Item>)
                                        }
                                    </section>
                                    <section key="ip-confirm-4" className="fs-ip-input-member">
                                        <Divider className="fs-ip-input-title">{lang("浮动IP", 'Float IP')}</Divider>
                                        {this.props.floatIPs.map((ip, i) =>
                                            <Form.Item className="fs-ip-input-item" key={i}>
                                                <span>{ip}</span>
                                            </Form.Item>)
                                        }
                                    </section>
                                </QueueAnim>
                            </div>
                        </div>
                    }
                    {
                        this.state.current === 2 &&
                        <div className="fs-initialize-step-content">
                            <QueueAnim type="left">
                                <section key="fs-initializing-1" className="fs-ip-input-title">
                                    {lang(
                                        '步骤3：初始化已经开始！您可以去放松一下或做点其他事情，我们会在您回来之前搞定一切。',
                                        'Step3: Initializing has just begun! Relax yourself or do some other things, we will be done when you come back.'
                                    )}
                                </section>
                            </QueueAnim>
                            <QueueAnim type="right">
                                <Progress key="fs-initializing-2" percent={this.state.initProgress} status={this.state.initProgress === 100 ? 'success' : 'active'} />
                            </QueueAnim>
                            <QueueAnim type="bottom">
                                <section key="fs-initializing-3" className="fs-initialization-wrapper" ref={ref => this.initInfoWrapper = ref}>
                                    {this.state.initializationInfo.map((info, i) => <p className="fs-initialization-info" key={i}>{info}</p>)}
                                </section>
                            </QueueAnim>
                        </div>
                    }
                    {
                        this.state.current === 3 &&
                        <div className="fs-initialize-step-content">
                            <QueueAnim>
                                <section key="fs-initialized-1" className="fs-ip-input-title">
                                    <p>
                                        {lang(
                                            '步骤4：初始化已完成，您的存储集群已经准备好了!',
                                            'Step4: The initialization is complete and your storage cluster is ready!'
                                        )}
                                    </p>
                                </section>
                            </QueueAnim>
                            <QueueAnim type="bottom">
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
                        this.state.current > 0 &&
                        this.state.current !== this.state.stepNum - 1 &&
                        this.state.current !== this.state.stepNum - 2 &&
                        <Button className="fs-initialize-btn prev" size="small" onClick={this.prev.bind(this)}>
                            <Icon type="left" /> {lang('上一步', 'Previous')}
                        </Button>
                    }
                    {
                        (this.state.current === 0 || this.state.current === 1) &&
                        <Button className="fs-initialize-btn next" size="small" onClick={this.next.bind(this)}>
                            {lang('下一步', 'Next')} <Icon type="right" />
                        </Button>
                    }
                    {
                        this.state.current === this.state.stepNum - 1 &&
                        <Button className="fs-initialize-btn done" size="small" onClick={this.forwardLogin.bind(this)}>
                            <Icon type="check" /> {lang('开始使用', 'Start Using')}
                        </Button>
                    }
                </section >
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, initialize: {metadataServerIPs, storageServerIPs, managementServerIPs, floatIPs}} = state;
    return {language, metadataServerIPs, storageServerIPs, managementServerIPs, floatIPs};
};

const mapDispatchToProps = dispatch => {
    return {
        addIP: category => dispatch(initializeAction.addIP(category)),
        removeIP: (category, index) => dispatch(initializeAction.removeIP(category, index)),
        setIP: (category, index, ip) => dispatch(initializeAction.setIP(category, index, ip)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initialize);