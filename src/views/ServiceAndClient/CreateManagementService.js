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
            serviceData: {
                managementServerIP: '',
                floatIP: '',
                hbIP1: '',
                hbIP2: '',
            },
            validation: {
                managementServerIP: {status: '', help: '', valid: false},
                floatIP: {status: '', help: '', valid: false},
                hbIP1: {status: '', help: '', valid: false},
                hbIP2: {status: '', help: '', valid: false},
            },
        };
    }

    componentWillReceiveProps (nextProps){
        let {managementServerIPs} = nextProps;
        if (managementServerIPs.length >= 2){
            message.warning(lang('当前已有2个管理服务，不能再创建了。', 'There are already two management services existing, can not create any more.'));
            return this.hide();
        }
    }

    formValueChange (key, value){
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
        let {serviceData} = this.state;
        let ip = serviceData[key];

        // for all
        if (!ip){
            this.validationUpdateState(key, {cn: '请输入IP', en: 'Please select the IP'}, false);
        } else if (!validateIpv4(ip)){
            this.validationUpdateState(key, {cn: 'IP格式错误', en: 'This pattern of this IP is incorrect'}, false);
        }

        if (key === 'managementServerIP'){
            let managementServerIPDuplicated = this.props.managementServerIPs.includes(ip);
            if (managementServerIPDuplicated){
                this.validationUpdateState('managementServerIP', {cn: '该IP已被一个已存在的管理服务使用', en: 'This IP has been used by a existing management service'}, false);
            }
        }

        if (key === 'hbIP1'){
            let hbIP2 = this.state.serviceData.hbIP2;
            if (!!ip && ip === hbIP2){
                this.validationUpdateState('hbIP1', {cn: '同类型IP不能重复', en: 'The IPs in one type can\'t be the same with each other'}, false);
            }
        }

        if (key === 'hbIP2'){
            let hbIP1 = this.state.serviceData.hbIP1;
            if (!!ip && ip === hbIP1){
                this.validationUpdateState('hbIP1', {cn: '同类型IP不能重复', en: 'The IPs in one type can\'t be the same with each other'}, false);
            }
        }

        // do some advanced validation
        await this.validateIPForHA();
        await this.validateNetworkSegmentForMgmtAndHAIPs();

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async validateIPForHA (){
        // once enabled HA for management server, management server IPs shouldn't be the same with any of metadata, storage or client server IPs
        let {metadataServerIPs, storageServerIPs, clientIPs} = this.props;
        let {serviceData: {managementServerIP}} = this.state;
        let errorHelp = {cn: '为管理服务启用HA后，管理服务器IP不能与任何元数据、存储服务或客户端的IP相同', en: 'once enabled HA for management service, management services IPs\' shouldn\'t be the same with any of metadata, storage server or client IPs'};
        if (managementServerIP){
            if (metadataServerIPs.includes(managementServerIP) ||
                storageServerIPs.includes(managementServerIP) ||
                clientIPs.includes(managementServerIP)
            ){
                await this.validationUpdateState('managementServerIP', errorHelp, false);
            } else {
                if (!!this.state.validation.managementServerIP.status){
                    await this.validationUpdateState('managementServerIP', {cn: '', en: ''}, true);
                }
            }
        }
    }

    async validateNetworkSegmentForMgmtAndHAIPs (){
        // firstly should pass the basic validation
        if (!this.state.validation.managementServerIP.status){
            let mgmtIP1 = this.props.metadataServerIPs[0];
            let {serviceData: {managementServerIP: mgmtIP2, hbIP1, hbIP2}} = this.state;
            let errorHelp = {cn: '管理服务器IP不能与和它对应的连接检测IP处于相同网段', en: 'Management Server IP shouldn\'t be in the same network segment with its corresponding Heartbeat IP'};
            let [mgmtIP1_1, mgmtIP1_2, mgmtIP1_3] = mgmtIP1.split('.');
            let [hbIP1_1, hbIP1_2, hbIP1_3] = hbIP1.split('.');
            if (!(mgmtIP1_1 !== hbIP1_1 || mgmtIP1_2 !== hbIP1_2 || mgmtIP1_3 !== hbIP1_3)){
                await this.validationUpdateState('hbIP1', errorHelp, false);
            } else {
                if (!!mgmtIP1){
                    await this.validationUpdateState('hbIP1', {cn: '', en: ''}, true);
                }
            }
            let [mgmtIP2_1, mgmtIP2_2, mgmtIP2_3] = mgmtIP2.split('.');
            let [hbIP2_1, hbIP2_2, hbIP2_3] = hbIP2.split('.');
            if (!(mgmtIP2_1 !== hbIP2_1 || mgmtIP2_2 !== hbIP2_2 || mgmtIP2_3 !== hbIP2_3)){
                await this.validationUpdateState('hbIP2', errorHelp, false);
            } else {
                if (!!mgmtIP2){
                    await this.validationUpdateState('hbIP2', {cn: '', en: ''}, true);
                }
            }
        }
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

    show (){
        this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            serviceData: {
                managementServerIP: '',
                floatIP: '',
                hbIP1: '',
                hbIP2: ''
            },
            validation: {
                managementServerIP: {status: '', help: '', valid: false},
                floatIP: {status: '', help: '', valid: false},
                hbIP1: {status: '', help: '', valid: false},
                hbIP2: {status: '', help: '', valid: false},
            },
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0, placement: 'right'};
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
        let {managementServerIPs} = this.props;
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
                    <div style={{margin: '-24px -24px 20px', padding: '14px', fontSize: 12, background: '#f3f3f3'}}>
                        {lang(
                            '鉴于当前已经存在有1个管理服务，您本次添加管理服务将直接启用HA功能。',
                            'Consider to that there is already 1 existing management service currently, this time you add management service will enable HA feature directly.')
                        }
                    </div>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('已存在的管理服务IP', 'Existing Service IP')}
                    >
                        <Input
                            style={{width: isChinese ? 255 : 225}}
                            size="small"
                            readOnly
                            value={managementServerIPs[0]}
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('新的管理服务IP', 'New Service IP')}
                        validateStatus={this.state.validation.managementServerIP.status}
                        help={this.state.validation.managementServerIP.help}
                    >
                        <Input
                            style={{width: isChinese ? 255 : 225}}
                            size="small"
                            placeholder={lang('请输入需要新增的管理服务的IP', 'please enter the new management service IP')}
                            value={this.state.serviceData.managementServerIP}
                            onChange={({target: {value}}) => this.formValueChange.bind(this, 'managementServerIP', value)()}
                            onBlur={() => this.validateForm.bind(this, 'managementServerIP')()}
                        />
                    </Form.Item>
                    <Divider dashed style={{margin: '10px 0'}} />
                    <span style={{fontSize: 12}}>{lang('HA(高可用性) 相关项', 'HA(High Availability) Related Items')}</span>
                    <Divider dashed style={{margin: '10px 0'}} />
                    <Form.Item
                        {...formItemLayout}
                        label={lang('集群服务管理IP', 'Service Management IP')}
                        validateStatus={this.state.validation.floatIP.status}
                        help={this.state.validation.floatIP.help}
                    >
                        <Input
                            style={{width: isChinese ? 230 : 200}}
                            size="small"
                            placeholder={lang('请输入集群服务管理IP', 'please enter cluster service management IP')}
                            value={this.state.serviceData.floatIP}
                            onChange={({target: {value}}) => this.formValueChange.bind(this, 'floatIP', value)()}
                            onBlur={() => this.validateForm.bind(this, 'floatIP')()}
                        />
                        <Popover
                            {...buttonPopoverConf}
                            content={lang('该IP用来给管理平台提供服务', 'The IP that servers the management platform')}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-l" />
                        </Popover>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('连接有效性检测IP 1', 'Connection check IP 1')}
                        validateStatus={this.state.validation.hbIP1.status}
                        help={this.state.validation.hbIP1.help}
                    >
                        <Input
                            style={{width: isChinese ? 230 : 200}}
                            size="small"
                            placeholder={lang('请输入连接有效性检测IP 1', 'please enter heart beat IP 1')}
                            value={this.state.serviceData.hbIP1}
                            onChange={({target: {value}}) => this.formValueChange.bind(this, 'hbIP1', value)()}
                            onBlur={() => this.validateForm.bind(this, 'hbIP1')()}
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
                        validateStatus={this.state.validation.hbIP2.status}
                        help={this.state.validation.hbIP2.help}
                    >
                        <Input
                            style={{width: isChinese ? 230 : 200}}
                            size="small"
                            placeholder={lang('请输入连接有效性检测IP 2', 'please enter heart beat IP 2')}
                            value={this.state.serviceData.hbIP2}
                            onChange={({target: {value}}) => this.formValueChange.bind(this, 'hbIP2', value)()}
                            onBlur={() => this.validateForm.bind(this, 'hbIP2')()}
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
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {dashboard: {clusterServiceRoleIPs: {metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs}}}} = state;
    return {language, metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateManagementService);