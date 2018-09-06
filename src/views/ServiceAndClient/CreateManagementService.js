import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Divider, Form, Icon, Input, message, Modal, Popover} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';
import {validateIpv4, lsSet} from 'Services';

class CreateManagementService extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            serviceData: {
                mgmtIP1: '',
                mgmtIP2: '',
                floatIP: '',
                hbIP1: '',
                hbIP2: '',
            },
            validation: {
                mgmtIP1: {status: '', help: '', valid: false},
                mgmtIP2: {status: '', help: '', valid: false},
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
        validation = Object.assign({}, this.state.validation, validation);
        await this.setState({validation});
    }

    async validateForm (key){
        await this.validationUpdateState(key, {cn: '', en: ''}, true);
        let {serviceData} = this.state;
        let ip = serviceData[key];

        if (key === 'mgmtIP1' || key === 'mgmtIP2'){
            if (!validateIpv4(ip)){
                await this.validationUpdateState(key, {cn: 'IP格式错误', en: 'This pattern of this IP is incorrect'}, false);
            }
            let mgmtIP2Duplicated = this.props.managementServerIPs.includes(ip);
            if (mgmtIP2Duplicated){
                await this.validationUpdateState(key, {cn: '该IP已被一个已存在的管理服务使用', en: 'This IP has been used by a existing management service'}, false);
            }
            let anotherMgmtIP = '';
            if (key === 'mgmtIP1'){
                anotherMgmtIP = this.state.serviceData.mgmtIP2;
            } else {
                anotherMgmtIP = this.state.serviceData.mgmtIP1;
            }
            if (anotherMgmtIP === ip){
                await this.validationUpdateState('mgmtIP1', {cn: '两个管理服务IP不能相同', en: 'The two management service IPs can not be the same'}, false);
                await this.validationUpdateState('mgmtIP2', {cn: '两个管理服务IP不能相同', en: 'The two management service IPs can not be the same'}, false);
            }
        }

        if (key === 'floatIP'){
            if (!validateIpv4(ip)){
                await this.validationUpdateState('floatIP', {cn: 'IP格式错误', en: 'This pattern of this IP is incorrect'}, false);
            }
        }

        if (key === 'hbIP1'){
            if (!validateIpv4(ip)){
                await this.validationUpdateState('hbIP1', {cn: 'IP格式错误', en: 'This pattern of this IP is incorrect'}, false);
            }
            let hbIP2 = this.state.serviceData.hbIP2;
            if (!!ip && ip === hbIP2){
                await this.validationUpdateState('hbIP1', {cn: '同类型IP不能重复', en: 'The IPs in one type can\'t be the same with each other'}, false);
            }
        }

        if (key === 'hbIP2'){
            if (!validateIpv4(ip)){
                await this.validationUpdateState('hbIP2', {cn: 'IP格式错误', en: 'This pattern of this IP is incorrect'}, false);
            }
            let hbIP1 = this.state.serviceData.hbIP1;
            if (!!ip && ip === hbIP1){
                await this.validationUpdateState('hbIP2', {cn: '同类型IP不能重复', en: 'The IPs in one type can\'t be the same with each other'}, false);
            }
        }

        if (key === 'mgmtIP1' || key === 'mgmtIP2' || key === 'hbIP1' || key === 'hbIP2'){
            if (this.state.validation[key].valid){
                console.info(this.state.validation[key].valid);
                // do some advanced validations for mgmtIP and hbIP
                await this.validateIPForHA();
                await this.validateNetworkSegmentForMgmtAndHAIPs();
            }
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            console.info(key, this.state.validation[key].valid);
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async validateIPForHA (){
        // once enabled HA for management server, management server IPs shouldn't be the same with any of metadata, storage or client server IPs
        let {metadataServerIPs, storageServerIPs, clientIPs} = this.props;
        let {serviceData} = this.state;
        let errorHelp = {cn: '为管理服务启用HA后，管理服务器IP不能与任何元数据、存储服务或客户端的IP相同', en: 'once enabled HA for management service, management services IPs\' shouldn\'t be the same with any of metadata, storage server or client IPs'};
        let mgmtIPs = ['mgmtIP1', 'mgmtIP2'];
        for (let i = 0; i < mgmtIPs.length; i ++){
            let key = mgmtIPs[i];
            let mgmtIP = serviceData[key];
            if (metadataServerIPs.includes(mgmtIP) ||
                storageServerIPs.includes(mgmtIP) ||
                clientIPs.includes(mgmtIP)
            ){
                await this.validationUpdateState(key, errorHelp, false);
            } else {
                if (!!this.state.validation[key].status){
                    await this.validationUpdateState(key, {cn: '', en: ''}, true);
                }
            }
        }
    }

    async validateNetworkSegmentForMgmtAndHAIPs (){
        // firstly should pass the basic validation
        if (!!this.state.validation.mgmtIP1.status|| !!this.state.validation.mgmtIP2.status){
            // management server IPs haven't pass the basic validation
            return;
        }
        let {serviceData: {mgmtIP1, mgmtIP2, hbIP1, hbIP2}} = this.state;
        let errorHelp = {cn: '管理服务器IP不能与和它对应的连接检测IP处于相同网段', en: 'Management Server IP shouldn\'t be in the same network segment with its corresponding Heartbeat IP'};
        let [mgmtIP1_1, mgmtIP1_2, mgmtIP1_3] = mgmtIP1.split('.');
        let [hbIP1_1, hbIP1_2, hbIP1_3] = hbIP1.split('.');
        if (!(mgmtIP1_1 !== hbIP1_1 || mgmtIP1_2 !== hbIP1_2 || mgmtIP1_3 !== hbIP1_3)){
            await this.validationUpdateState('mgmtIP1', errorHelp, false);
        } else {
            if (!!mgmtIP1){
                await this.validationUpdateState('mgmtIP1', {cn: '', en: ''}, true);
            }
        }
        let [mgmtIP2_1, mgmtIP2_2, mgmtIP2_3] = mgmtIP2.split('.');
        let [hbIP2_1, hbIP2_2, hbIP2_3] = hbIP2.split('.');
        if (!(mgmtIP2_1 !== hbIP2_1 || mgmtIP2_2 !== hbIP2_2 || mgmtIP2_3 !== hbIP2_3)){
            await this.validationUpdateState('mgmtIP2', errorHelp, false);
        } else {
            if (!!mgmtIP2){
                await this.validationUpdateState('mgmtIP2', {cn: '', en: ''}, true);
            }
        }
    }

    async create (){
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行创建管理服务并开启HA功能的操作。`, `You are about to create management service and enable HA feature.`)}</p>
                <p>{lang(`该操作将会在集群架构上做一些调整，在这一过程中无法任何其他其他操作。这需要一定时间才能完成。`, `This operation will make some adjustments on cluster architecture. Can't do anything in this process. This will take some time to finish it.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保无其他用户或者业务正在使用或运行在系统上。`, `A suggestion: before executing this operation, ensure that the there is no user and service is using or running on the system.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('创建', 'Create'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                // It's going to be used on re-initializing page
                lsSet('floatIP', this.state.serviceData.floatIP);
                let serviceData = Object.assign({}, this.state.serviceData);
                this.setState({formSubmitting: true});
                try {
                    await httpRequests.createManagementServiceToCluster(serviceData);
                    httpRequests.getClusterServiceAndClientIPs();
                    // await this.hide();
                    // message.success(lang(`创建管理服务 ${serviceData.ip} 成功!`, `Create management service ${serviceData.ip} successfully!`));
                } catch ({msg}){
                    message.error(lang(`创建管理服务 ${serviceData.ip} 失败, 原因: `, `Create management service ${serviceData.ip} failed, reason: `) + msg);
                }
                this.setState({formSubmitting: false});
            },
            onCancel: () => {

            }
        });
    }

    show (){
        let {metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs} = this.props;
        let mgmtIP1 = managementServerIPs[0];
        let mgmtIP1Usability = !(metadataServerIPs.includes(mgmtIP1) || storageServerIPs.includes(mgmtIP1) || clientIPs.includes(mgmtIP1));
        this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            serviceData: {
                mgmtIP1Usability,
                mgmtIP1: mgmtIP1Usability ? mgmtIP1 : '',
                mgmtIP2: '',
                floatIP: '',
                hbIP1: '',
                hbIP2: ''
            },
            validation: {
                mgmtIP1: {status: '', help: '', valid: mgmtIP1Usability},
                mgmtIP2: {status: '', help: '', valid: false},
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
                        {this.state.mgmtIP1Usability ?
                            lang(
                                '当前已经存在有1个可用的管理服务，再添加1个新的管理服务就能启用高可用性功能。',
                                'There is already 1 existing and usable management service currently, add a new management service will enable High Availability feature.'
                            ) :
                            lang(
                                '在初始时添加的管理服务所在的节点上还运行有其他服务，因此不能被用户开启高可用性功能。需要输入2个未运行其他任何服务的节点的IP，新的2个管理服务将分别运行在这2个节点上。',
                                'The node that management service IP added in initialization has some other services run on, so it can not be used for enabling High Availability feature. There are 2 node IPs need with no other services run on, the new 2 management services will run on them respectively.'
                            )
                        }
                    </div>
                    {
                        this.state.mgmtIP1Usability ? <Form.Item
                            {...formItemLayout}
                            label={lang('已存在的管理服务IP', 'Existing Service IP')}
                        >
                            <Input
                                style={{width: isChinese ? 255 : 225}}
                                size="small"
                                readOnly
                                value={this.state.serviceData.mgmtIP1}
                            />
                        </Form.Item> :
                        <Form.Item
                            {...formItemLayout}
                            label={lang('管理服务IP 1', 'Management Service IP 1')}
                            validateStatus={this.state.validation.mgmtIP1.status}
                            help={this.state.validation.mgmtIP1.help}
                        >
                            <Input
                                style={{width: isChinese ? 255 : 225}}
                                size="small"
                                placeholder={lang('请输入需要新增的管理服务的IP 1', 'The new management service IP 1')}
                                value={this.state.serviceData.mgmtIP1}
                                onChange={({target: {value}}) => this.formValueChange.bind(this, 'mgmtIP1', value)()}
                                onBlur={({target: {value}}) => !!value && this.validateForm.bind(this, 'mgmtIP1')()}
                            />
                        </Form.Item>
                    }
                    <Form.Item
                        {...formItemLayout}
                        label={lang('管理服务IP', 'Management Service IP') + (this.state.mgmtIP1Usability ? '' : ' 2')}
                        validateStatus={this.state.validation.mgmtIP2.status}
                        help={this.state.validation.mgmtIP2.help}
                    >
                        <Input
                            style={{width: isChinese ? 255 : 225}}
                            size="small"
                            placeholder={lang('请输入需要新增的管理服务的IP', 'The new management service IP') + (this.state.mgmtIP1Usability ? '' : ' 2')}
                            value={this.state.serviceData.mgmtIP2}
                            onChange={({target: {value}}) => this.formValueChange.bind(this, 'mgmtIP2', value)()}
                            onBlur={({target: {value}}) => !!value && this.validateForm.bind(this, 'mgmtIP2')()}
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
                            placeholder={lang('请输入集群服务管理IP', 'Cluster service management IP')}
                            value={this.state.serviceData.floatIP}
                            onChange={({target: {value}}) => this.formValueChange.bind(this, 'floatIP', value)()}
                            onBlur={({target: {value}}) => !!value && this.validateForm.bind(this, 'floatIP')()}
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
                            placeholder={lang('请输入连接有效性检测IP 1', 'Connection validity check IP 1')}
                            value={this.state.serviceData.hbIP1}
                            onChange={({target: {value}}) => this.formValueChange.bind(this, 'hbIP1', value)()}
                            onBlur={({target: {value}}) => !!value && this.validateForm.bind(this, 'hbIP1')()}
                        />
                        <Popover
                            {...buttonPopoverConf}
                            content={
                                lang(
                                    `对应管理服务2，并不能与它的IP处于同一网段`,
                                    `It is corresponding to management service 2, and can't be in the same its IP`
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
                            placeholder={lang('请输入连接有效性检测IP 2', 'Connection validity check IP 2')}
                            value={this.state.serviceData.hbIP2}
                            onChange={({target: {value}}) => this.formValueChange.bind(this, 'hbIP2', value)()}
                            onBlur={({target: {value}}) => !!value && this.validateForm.bind(this, 'hbIP2')()}
                        />
                        <Popover
                            {...buttonPopoverConf}
                            content={
                                lang(
                                    `对应管理服务2，并不能与它的IP处于同一网段`,
                                    `It is corresponding to management service 2, and can't be in the same its IP`
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
    let {language, main: {dashboard: {clusterServiceAndClientIPs: {metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs}}}} = state;
    return {language, metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateManagementService);