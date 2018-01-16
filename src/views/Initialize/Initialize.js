import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Divider, Icon, Input, Steps} from 'antd';
import initializeAction from '../../redux/actions/initializeAction';
import LanguageButton from '../../components/Language/LanguageButton';
import lang from '../../components/Language/lang';
import routerPath from '../routerPath';

class Initialize extends Component {
    constructor (props){
        super(props);
        this.state = {
            current: 0,
            steps: [
                {title: lang('定义角色', 'Define Roles')},
                {title: lang('信息确认', 'Information Confirm')},
                {title: lang('开始安装', 'Start Installing')},
                {title: lang('完成', 'Completed')}
            ],
        };
    }

    removeIP (category, ip){
        console.info(category, ip);
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
                        <div className="fs-initialize-step-content">
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
                                        <section className="fs-ip-input-item" key={i}>
                                            <Input className="fs-ip-input" value={ip}
                                               addonAfter={<Button title={lang('移除', 'Remove')} icon="minus" size="small" />}
                                               onChange={this.removeIP.bind(this, 'metadataServers', ip)}
                                            />
                                        </section>)
                                    }
                                    <Button className="fs-ip-plus-btn" title={lang('添加', 'Add')} icon="plus" size="small" />
                                </section>
                                <section className="fs-ip-input-wrapper">
                                    <Divider className="fs-ip-input-title">{lang('存储服务器', 'Storage Servers')}</Divider>
                                    {this.props.storageServerIPs.map((ip, i) =>
                                        <section className="fs-ip-input-item" key={i}>
                                            <Input className="fs-ip-input" value={ip}
                                               addonAfter={<Button title={lang('移除', 'Remove')} icon="minus" size="small" />}
                                               onChange={this.removeIP.bind(this, 'storageServers', ip)}
                                            />
                                        </section>)
                                    }
                                    <Button className="fs-ip-plus-btn" title={lang('添加', 'Add')} icon="plus" size="small" />
                                </section>
                                <section className="fs-ip-input-wrapper">
                                    <Divider className="fs-ip-input-title">{lang('客户端', 'Client')}</Divider>
                                    {this.props.clientIPs.map((ip, i) =>
                                        <section className="fs-ip-input-item" key={i}>
                                            <Input className="fs-ip-input" value={ip}
                                                addonAfter={<Button title={lang('移除', 'Remove')} icon="minus" size="small" />}
                                                onChange={this.removeIP.bind(this, 'client', ip)}
                                            />
                                        </section>)
                                    }
                                    <Button className="fs-ip-plus-btn" title={lang('添加', 'Add')} icon="plus" size="small" />
                                </section>
                            </div>
                        </div>
                    }
                </section >
                <section className="fs-initialize-step-action-wrapper">
                    {
                        this.state.current > 0 &&
                        this.state.current !== this.state.steps.length - 1 &&
                        this.state.current !== this.state.steps.length - 2 &&
                        <Button className="fs-initialize-btn prev" size="small" onClick={this.prev.bind(this)}>
                            <Icon type="left" /> {lang('上一步', 'Previous')}
                        </Button>
                    }
                    {
                        this.state.current < this.state.steps.length - 1 &&
                        this.state.current !== this.state.steps.length - 2 &&
                        <Button className="fs-initialize-btn next" size="small" onClick={this.next.bind(this)}>
                            {lang('下一步', 'Next')} <Icon type="right" />
                        </Button>
                    }
                    {
                        this.state.current === this.state.steps.length - 1 &&
                        <Button className="fs-initialize-btn done" size="small" onClick={this.forwardLogin.bind(this)}>
                            <Icon type="check" /> {lang('完成', 'Done')}
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
        setMetadataServerIPs: ips => dispatch(initializeAction.setMetadataServerIPs(ips)),
        setStorageServerIPs: ips => dispatch(initializeAction.setMetadataServerIPs(ips)),
        setClientIPs: ips => dispatch(initializeAction.setMetadataServerIPs(ips))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initialize);