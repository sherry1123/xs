import React, {Component} from 'react';
import {connect} from 'react-redux';
import update from "react-addons-update";
import {Button, Divider, Form, Icon, Input, Steps} from 'antd';
import initializeAction from '../../redux/actions/initializeAction';
import LanguageButton from '../../components/Language/LanguageButton';
import {validateIpv4} from '../../services';
import lang from '../../components/Language/lang';
import routerPath from '../routerPath';

class Initialize extends Component {
    constructor (props){
        super(props);
        let {metadataServerIPs, storageServerIPs, clientIPs} = props;
        this.state = {
            current: 0,
            stepNum: 4,
            metadataServerIPsError: metadataServerIPs.map(() => ({status: '', help: ''})),
            storageServerIPsError: storageServerIPs.map(() => ({status: '', help: ''})),
            clientIPsError: clientIPs.map(() => ({status: '', help: ''})),
        };
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
        // 在state中修改嵌套数组或者对象是什么沉重的，可移到redux里面进行维护
        let newState;
        let mutation = errorObj === 'remove' ? [i, 1] : [i, 1, errorObj];
        switch (category){
            case 'metadataServerIPs':
                newState = update(this.state, {metadataServerIPsError: {$splice: [mutation]}});
                break;
            case 'storageServerIPs':
                newState = update(this.state, {storageServerIPsError: {$splice: [mutation]}});
                break;
            case 'clientIPs':
                newState = update(this.state, {clientIPsError: {$splice: [mutation]}});
                break;
            default:
                break;
        }
        await this.setState(Object.assign(this.state, newState));
        console.info(this.state);
    }

    async validateIP (category, i, value) {
        // reset to successfully firstly
        await this.setErrorArr(category, i, {status: '', help: ''});

        // validate ipv4 address pattern
        if (!validateIpv4(value)){
            await this.setErrorArr(category, i, {status: 'error', help: lang('IP格式错误', 'pattern error')});
        }

        // validate whether this value is duplicated with one of the ips of current server category
        let currentIPs = this.props[category];
        let duplicated = currentIPs.some((ip, index) => (ip === value && index !== i));
        if (duplicated){
            await this.setErrorArr(category, i, {status: 'error', help: lang('IP在所在分类中有重复', 'duplicated')});
        }
    }

    prev (){
        this.setState({current: this.state.current - 1});
    }

    next (){
        this.setState({current: this.state.current + 1});
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
                <Steps className="fs-initialize-step-index-wrapper" current={this.state.current}>
                    <Steps.Step title={lang('定义角色', 'Define Roles')} />
                    <Steps.Step title={lang('信息确认', 'Information Confirm')} />
                    <Steps.Step title={lang('开始安装', 'Start Installing')} />
                    <Steps.Step title={lang('完成', 'Completed')} />
                </Steps>
                <Divider className="fs-initialize-divider-wrapper" dashed />
                <section className="fs-initialize-step-content-wrapper">
                    {
                        this.state.current === 0 &&
                        <Form className="fs-initialize-step-content">
                            <section className="fs-ip-input-title">
                                {lang(
                                    '请定义将作为元数据服务器、存储服务器和客户端的管理主机的IP。每个类别请在每一行提供一个IP。运行admon守护进程的管理主机的默认值是相同的IP。',
                                    'Please define the management IP of the hosts which shall act as metadata servers, storage servers and clients. For each category provide one IP per line. The default value for the management daemon is the same IP, which runs the admon daemon.'
                                )}
                            </section>
                            <div className="fs-ip-input-group">
                                <section className="fs-ip-input-wrapper">
                                    <Divider className="fs-ip-input-title">{lang('元数据服务器', 'Metadata Servers')}</Divider>
                                    {this.props.metadataServerIPs.map((ip, i) =>
                                        <Form.Item className="fs-ip-input-item" key={i}
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
                                    <Button className="fs-ip-plus-btn" title={lang('添加', 'add')} icon="plus" size="small"
                                        onClick={this.addIP.bind(this, 'metadataServerIPs')} />
                                </section>
                                <section className="fs-ip-input-wrapper">
                                    <Divider className="fs-ip-input-title">{lang('存储服务器', 'Storage Servers')}</Divider>
                                    {this.props.storageServerIPs.map((ip, i) =>
                                        <Form.Item className="fs-ip-input-item" key={i}
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
                                    <Button className="fs-ip-plus-btn" title={lang('添加', 'add')} icon="plus" size="small"
                                        onClick={this.addIP.bind(this, 'metadataServerIPs')} />
                                </section>
                                <section className="fs-ip-input-wrapper">
                                    <Divider className="fs-ip-input-title">{lang('客户端', 'Client')}</Divider>
                                    {this.props.clientIPs.map((ip, i) =>
                                        <Form.Item className="fs-ip-input-item" key={i}
                                            validateStatus={this.state['clientIPsError'][i].status}
                                            help={this.state['clientIPsError'][i].help}
                                        >
                                            <Input className="fs-ip-input" value={ip}
                                                onChange={({target: {value}}) => {
                                                   this.setIP.bind(this, 'clientIPs', i, value)();
                                                   this.validateIP.bind(this, 'clientIPs', i, value)();
                                                }}
                                                addonAfter={
                                                    <Button title={lang('移除', 'remove')} icon="minus" size="small"
                                                        onClick={this.removeIP.bind(this, 'clientIPs', i)}/>
                                                }
                                            />
                                        </Form.Item>)
                                    }
                                    <Button className="fs-ip-plus-btn" title={lang('添加', 'add')} icon="plus" size="small"
                                        onClick={this.addIP.bind(this, 'clientIPs')} />
                                </section>
                            </div>
                        </Form>
                    }
                    {
                        this.state.current === 1 &&
                        <div className="fs-initialize-step-content">
                            <div className="fs-ip-input-group">
                                <section className="fs-ip-input-wrapper">
                                    <Divider className="fs-ip-input-title">{lang('元数据服务器', 'Metadata Servers')}</Divider>
                                    {this.props.metadataServerIPs.map((ip, i) =>
                                        <Form.Item className="fs-ip-input-item" key={i}>
                                            <span>{ip}</span>
                                        </Form.Item>)
                                    }
                                </section>
                                <section className="fs-ip-input-wrapper">
                                    <Divider className="fs-ip-input-title">{lang('存储服务器', 'Storage Servers')}</Divider>
                                    {this.props.storageServerIPs.map((ip, i) =>
                                        <Form.Item className="fs-ip-input-item" key={i}>
                                            <span>{ip}</span>
                                        </Form.Item>)
                                    }
                                </section>
                                <section className="fs-ip-input-wrapper">
                                    <Divider className="fs-ip-input-title">{lang('客户端', 'Client')}</Divider>
                                    {this.props.clientIPs.map((ip, i) =>
                                        <Form.Item className="fs-ip-input-item" key={i}>
                                            <span>{ip}</span>
                                        </Form.Item>)
                                    }
                                </section>
                            </div>
                        </div>
                    }
                    {
                        this.state.current === 2 &&
                        <div className="fs-initialize-step-content"
                            style={{border: '1px solid #e9e9e9', height: 350}}>
                            安装过程....，这里完成以后自动进入下一步
                        </div>
                    }
                    {
                        this.state.current === 3 &&
                        <div className="fs-initialize-step-content"
                             style={{border: '1px solid #e9e9e9', height: 350}}>
                            安装完成<br />
                            您的存储系统信息如下：

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
                        this.state.current < this.state.stepNum - 1 &&
                        this.state.current !== this.state.stepNum - 2 &&
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
    const {language, initialize: {metadataServerIPs, storageServerIPs, clientIPs}} = state;
    return {language, metadataServerIPs, storageServerIPs, clientIPs};
};

const mapDispatchToProps = dispatch => {
    return {
        addIP: category => dispatch(initializeAction.addIP(category)),
        removeIP: (category, index) => dispatch(initializeAction.removeIP(category, index)),
        setIP: (category, index, ip) => dispatch(initializeAction.setIP(category, index, ip)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initialize);