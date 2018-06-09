import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Divider, Form, Icon, Input, message, Modal, Popover} from 'antd';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';
import {validateIpv4} from '../../services';

class CreateManagementService extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            enableHA: false,
            serviceData: {
                ip: ''
            },
            validation: {
                ip: {status: '', help: '', valid: false},
            },
        };
    }

    componentWillReceiveProps (nextProps){
        let {managementServerIPs} = nextProps;
        if (managementServerIPs.length >= 2){
            message.warning(lang('当前已有2个管理服务，不能再创建了。', 'There are already two management services existing, can not create any more.'));
            return this.hide();
        }
        if (managementServerIPs.length >= 1){
            if (!this.state.enableHA){
                return this.setState({enableHA: true});
            }
        }
    }

    formValueChange (key, value){
        console.info(key, value);
        let serviceData = Object.assign({}, this.state.serviceData, {[key]: value});
        this.setState({serviceData});
    }

    async validationUpdateState (key, value, valid){
        let {cn, en} = value;
        let validation = {
            [key]: {
                status: (cn || en) ? 'error' : '',
                help: lang(cn, en),
                valid
            }
        };
        validation = Object.assign(this.state.validation, validation);
        await this.setState({validation});
    }

    async validateForm (key){
        await this.validationUpdateState(key, {cn: '', en: ''}, true);
        let {ip} = this.state.serviceData;
        if (key === 'ip'){
            if (!ip) {
                this.validationUpdateState('ip', {cn: '请选择要运行该NAS服务器的客户端IP', en: 'Please select the client IP for running on'}, false);
            }
            if (!validateIpv4(ip)){
                this.validationUpdateState('ip', {cn: '该IP格式错误', en: 'This pattern of this IP is incorrect'}, false);
            }
            let clientIPDuplicated = this.props.clientIPs.includes(ip);
            if (clientIPDuplicated){
                this.validationUpdateState('ip', {cn: '该IP已被一个已存在的客户端使用', en: 'This IP has been used by a existing client'}, false);
            }
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async create (){
        let serviceData = Object.assign({}, this.state.serviceData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createManagementServiceToCluster(serviceData);
            httpRequests.getClusterServiceAndClientIPs();
            await this.hide();
            message.success(lang(`创建管理服务 ${serviceData.ip} 成功!`, `Create management service ${serviceData.ip} successfully!`));
        } catch ({msg}){
            message.error(lang(`创建管理服务 ${serviceData.ip} 失败, 原因: `, `Create management service ${serviceData.ip} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (enableHA = false){
        this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            enableHA,
            serviceData: {
                ip: ''
            },
            validation: {
                ip: {status: '', help: '', valid: false},
            },
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0, placement: 'right'};
        let {enableHA} = this.state;
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 8 : 10},
                sm: {span: isChinese ? 8 : 10},
            },
            wrapperCol: {
                xs: {span: isChinese ? 16 : 14},
                sm: {span: isChinese ? 16 : 14},
            }
        };
        return (
            <Modal
                title={lang('创建管理服务', 'Create Management Service')}
                width={440}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            size="small"
                            type="primary"
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    {
                        !enableHA && <Form.Item
                            {...formItemLayout}
                            label={lang('管理服务IP', 'Management Service IP')}
                            validateStatus={this.state.validation.ip.status}
                            help={this.state.validation.ip.help}
                        >
                            <Input
                                style={{width: isChinese ? 225 : 225}}
                                size="small"
                                placeholder={lang('请输入管理服务IP', 'Please enter management service IP')}
                                value={this.state.serviceData.ip}
                                onChange={({target: {value}}) => this.formValueChange.bind(this, 'ip')(value)}
                                onBlur={() => this.validateForm.bind(this)('ip')}
                            />
                        </Form.Item>
                    }
                    {
                        enableHA && <div>
                            <div style={{margin: '-24px -24px 20px', padding: '14px', fontSize: 12, background: '#f3f3f3'}}>
                                {lang(
                                    '鉴于当前已经存在有1个管理服务，您本次添加管理服务将直接启用HA功能。',
                                    'Consider to that there is already 1 existing management service currently, this time you add management service will enable HA feature directly.')
                                }
                            </div>
                            <Form.Item
                                {...formItemLayout}
                                label={lang('已存在的管理服务1 IP', 'Existing Service 1 IP')}
                            >
                                <Input
                                    style={{width: isChinese ? 225 : 195}}
                                    size="small"
                                    readOnly
                                />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label={lang('新的管理服务2 IP', 'New Service 2 IP')}
                            >
                                <Input
                                    style={{width: isChinese ? 225 : 195}}
                                    size="small"
                                    placeholder={lang('请输入需要新增的管理服务2的IP', 'please enter service 2 IP which is the new one')}
                                />
                            </Form.Item>
                            <Divider dashed style={{margin: '10px 0'}} />
                            <span style={{fontSize: 12}}>{lang('HA(高可用性) 相关', 'HA(High Availability) Related')}</span>
                            <Divider dashed style={{margin: '10px 0'}} />
                            <Form.Item
                                {...formItemLayout}
                                label={lang('存储集群服务管理IP', 'Cluster Service Mgmt IP')}
                            >
                                <Input
                                    style={{width: isChinese ? 225 : 195}}
                                    size="small"
                                    placeholder={lang('请输入存储服务器集群管理IP', 'please enter cluster service management IP')}
                                />
                                <Popover
                                    {...buttonPopoverConf}
                                    content={lang('为管理平台提供服务的IP', 'The IP that servers the management platform')}
                                >
                                    <Icon type="question-circle-o" className="fs-info-icon m-l" />
                                </Popover>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label={lang('连接有效性检测IP 1', 'Connection check IP 1')}
                            >
                                <Input
                                    style={{width: isChinese ? 225 : 195}}
                                    size="small"
                                    placeholder={lang('请输入连接有效性检测IP 1', 'please enter heart beat IP 1')}
                                />
                                <Popover
                                    {...buttonPopoverConf}
                                    content={
                                        lang(
                                            `对应管理服务1，不能与管理服务所在节点处于同一网段`,
                                            `Corresponding with management service 1, can't be in the same network segment with management services`
                                        )
                                    }
                                >
                                    <Icon type="question-circle-o" className="fs-info-icon m-l" />
                                </Popover>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label={lang('连接有效性检测IP 2', 'Connection check IP 2')}
                            >
                                <Input
                                    style={{width: isChinese ? 225 : 195}}
                                    size="small"
                                    placeholder={lang('请输入连接有效性检测IP 2', 'please enter heart beat IP 2')}
                                />
                                <Popover
                                    {...buttonPopoverConf}
                                    content={
                                        lang(
                                            `对应管理服务2，不能与管理服务所在节点处于同一网段`,
                                            `Corresponding with management service 2, can't be in the same network segment with management services`
                                        )
                                    }
                                >
                                    <Icon type="question-circle-o" className="fs-info-icon m-l" />
                                </Popover>
                            </Form.Item>
                        </div>
                    }
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {dashboard: {clusterServiceRoleIPs: {managementServerIPs}}}} = state;
    return {language, managementServerIPs};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateManagementService);