import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, Radio, Select, message, Modal} from 'antd';
import lang from 'Components/Language/lang';
import {debounce, validationUpdateState, validateIpv4, /*validateIpv4Segment*/} from 'Services';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
@validationUpdateState(lang)
export default class CreateClientToNFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            notDirectlyCreate: false,
            clientListOfNFS: [],
            formValid: false,
            formSubmitting: false,
            showAdvanced: false,
            clientData: {
                path: '',
                type: 'host',
                ips: '',
                permission: 'readonly',
                writeMode: 'synchronous',
                permissionConstraint: 'all_squash',
                rootPermissionConstraint: 'root_squash'
            },
            validation: {
                ips: {status: '', help: '', valid: false},
            }
        };
    }

    @debounce(500)
    async validateForm (key){
        await this.validationUpdateState(key, {cn: '', en: ''}, true);
        let {clientListOfNFS, clientData: {ips}} = this.state;
        if (key === 'ips'){
            // validate essentials:
            // 1.ips split value is duplicated
            // 2.validate the enter of every hostname、IP or segment is match with IPV4 or hostname pattern
            // 3.validate if one of the enter of every hostname、IP or segment is already existed in this NFS share
            if (!this.state.clientData.ips){
                this.validationUpdateState('ips', {cn: '请输入主机名或IP', en: 'Please enter hostname or IP'}, false);
            }
            ips = ips.split(';').filter(ip => !!ip.trim());
            let isIPPatternError = !ips.some(ip => {
                // currently only allow user to enter IPV4 IPs, network segment and hostname are not allowed
                if (validateIpv4(ip)){
                    // it's a IPV4 IP
                    return true;
                } /*else if (validateIpv4Segment(ip)){
                    // it's a IPV4 segment
                    return true;
                }*/ else if (!!ip){
                    // it's a hostname
                    return true
                } else {
                    // it's a meaningless value
                    return false;
                }
            });
            if (isIPPatternError){
                this.validationUpdateState('ips', {cn: '主机名或IP输入有误', en: 'Hostname or IP enter error'}, false);
            }
            // console.info('ip pattern error', isIPPatternError);
            let isIpsDuplicated = Array.from(new Set(ips)).length !== ips.length;
            if (isIpsDuplicated){
                this.validationUpdateState('ips', {cn: '主机名或IP输入有重复', en: 'Hostname or IP enter duplicated'}, false);
            }
            // console.info('ip enter duplicated', isIpsDuplicated);
            let isIPDuplicated = clientListOfNFS.some(client => ips.includes(client.ip));
            // console.info('ip duplicated', isIPDuplicated);
            if (isIPDuplicated){
                this.validationUpdateState('ips', {cn: '主机名或IP已存在', en: 'Hostname or IP already existed'}, false);
            }
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    formValueChange (key, value){
        let clientData = {[key]: value};
        clientData = Object.assign({}, this.state.clientData, clientData);
        this.setState({clientData});
    }

    async create (){
        let {notDirectlyCreate, clientData} = this.state;
        if (notDirectlyCreate){
            // 如果是创建NFS的时候进行添加客户端，那么根据输入hostname、IP或网段的数量，返回同等数量的客户端信息
            let {ips} = clientData;
            ips = ips.split(';').filter(ip => !!ip.trim());
            let clientList = ips.map(ip => Object.assign({}, clientData, {ip}));
            this.props.onAdd && this.props.onAdd(clientList);
            this.hide();
            // console.info(clientList);
        } else {
            // 调用创建客户端接口直接创建客户端
            this.setState({formSubmitting: true});
            try {
                await httpRequests.createClientInNFSShare(clientData);
                httpRequests.getClientListByNFSSharePath(clientData.path);
                await this.hide();
                message.success(lang(`为NFS共享 ${clientData.path} 创建客户端成功!`, `Create client for NFS share ${clientData.path} successfully!`));
            } catch ({msg}){
                message.error(lang(`Create client for NFS share ${clientData.path} 失败, 原因: `, `Create client for NFS share ${clientData.path} failed, reason: `) + msg);
            }
            this.setState({formSubmitting: false});
        }
    }

    showAdvanced (){
        this.setState({showAdvanced: !this.state.showAdvanced});
    }

    show ({path, clientListOfNFS, notDirectlyCreate}){
        this.setState({
            visible: true,
            notDirectlyCreate,
            clientListOfNFS,
            formValid: false,
            formSubmitting: false,
            showAdvanced: false,
            clientData: {
                path,
                type: 'host',
                ips: '',
                permission: 'readonly',
                writeMode: 'synchronous',
                permissionConstraint: 'all_squash',
                rootPermissionConstraint: 'root_squash'
            },
            validation: {
                ips: {status: '', help: '', valid: false},
            }
        });
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 6 : 8},
                sm: {span: isChinese ? 6 : 8},
            },
            wrapperCol: {
                xs: {span: isChinese ? 18 : 16},
                sm: {span: isChinese ? 18 : 16},
            }
        };
        return (
            <Modal
                title={lang('创建客户端', 'Create Client')}
                width={isChinese ? 500 : 540}
                mask={false}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            disabled={this.state.formSubmitting}
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            size="small"
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
                    <Form.Item {...formItemLayout} label={lang('类型', 'Type')}>
                        {lang('主机', 'Host')}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('主机名/IP', 'hostname/IP')}
                        validateStatus={this.state.validation.ips.status}
                        help={this.state.validation.ips.help}
                    >
                        <Input.TextArea
                            style={{width: isChinese ? 300 : 300}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={200}
                            placeholder={lang('支持输入多个IPv4格式的IP或者主机名，用应为分号";"隔开。', 'You can enter multiple client IP addressed with IPV4 pattern or hostname, split by ";"')}
                            value={this.state.clientData.ips}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'ips')(value);
                            }}
                            onBlur={({target: {value}}) => {
                                this.validateForm.bind(this, 'ips')(value);
                            }}
                        />
                        {/* hide this item temporarily
                        // currently only allow user to enter IP
                        <Input.TextArea
                            style={{width: isChinese ? 300 : 300}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={200}
                            placeholder={lang('支持输入多个hostname、IP地址或网段，用英文分号隔开。IP地址和网段输入仅支持IPV4地址格式。', 'You can enter multiple hostname, IP addresses and segments of clients, separated by semicolon. IP address and segment only supports IPv4 address pattern.')}
                            value={this.state.clientData.ips}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'ips')(value);
                            }}
                            onBlur={({target: {value}}) => {
                                this.validateForm.bind(this, 'ips')(value);
                            }}
                        />
                        */}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('权限', 'Permission')}>
                        <Select
                            style={{width: isChinese ? 300 : 300}}
                            size="small"
                            value={this.state.clientData.permission}
                            onChange={value => {
                                this.formValueChange.bind(this, 'permission')(value);
                            }}
                        >
                            <Select.Option value="readonly">{lang('只读', 'Readonly')}</Select.Option>
                            {/*<Select.Option value="read-write-n">{lang('读写(不支持删除和重命名)', 'Read-write(not support delete and rename)')}</Select.Option>*/}
                            <Select.Option value="read_and_write">{lang('读写', 'Read-write')}</Select.Option>
                        </Select>
                    </Form.Item>
                    <div style={{paddingLeft: 10}}>
                        <span
                            style={{fontSize: 12, color: '#1890ff', cursor: 'pointer', userSelect: 'none'}}
                            onClick={this.showAdvanced.bind(this)}
                        >
                            {lang('高级', 'Advanced')} <Icon type={this.state.showAdvanced ? 'up' : 'down'} />
                        </span>
                    </div>
                    {
                        this.state.showAdvanced && <div>
                            <Form.Item {...formItemLayout} label={lang('写入模式', 'Write Mode')}>
                                <Radio.Group
                                    onChange={({target: {value}}) => {
                                        this.formValueChange.bind(this, 'writeMode')(value);
                                    }}
                                    value={this.state.clientData.writeMode}
                                >
                                    <Radio value={'synchronous'}>{lang('同步', 'Synchronous')}</Radio>
                                    <Radio value={'asynchronous'}>{lang('异步', 'Asynchronous')}</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={lang('权限限制', 'Permission Constraint')}>
                                <Radio.Group
                                    onChange={({target: {value}}) => {
                                        this.formValueChange.bind(this, 'permissionConstraint')(value);
                                    }}
                                    value={this.state.clientData.permissionConstraint}
                                >
                                    <Radio value={'all_squash'}>all_squash</Radio>
                                    <Radio value={'no_all_squash'}>no_all_squash</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={lang('root权限限制', 'root Permission Constraint')}>
                                <Radio.Group
                                    onChange={({target: {value}}) => {
                                        this.formValueChange.bind(this, 'rootPermissionConstraint')(value);
                                    }}
                                    value={this.state.clientData.rootPermissionConstraint}
                                >
                                    <Radio value={'root_squash'}>root_squash</Radio>
                                    <Radio value={'no_root_squash'}>no_root_squash</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </div>
                    }
                </Form>
            </Modal>
        );
    }
}