import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Radio, Select, message, Modal} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class EditClient extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            clientData: {
                path: '',
                type: 'host',
                ip: '',
                permission: 'readonly',
                writeMode: 'synchronous',
                permissionConstraint: 'all_squash',
                rootPermissionConstraint: 'root_squash'
            },
            validation: {
                path: {status: '', help: '', valid: false},
            }
        };
    }

    formValueChange (key, value){
        let clientData = {[key]: value};
        clientData = Object.assign({}, this.state.clientData, clientData);
        this.setState({clientData});
    }

    async edit (){
        let clientData = Object.assign({}, this.state.clientData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.updateClientInNFSShare(clientData);
            httpRequests.getClientListByNFSSharePath(clientData.path);
            await this.hide();
            message.success(lang('编辑客户端成功!', 'Edit Client successfully!'));
        } catch ({msg}){
            message.error(lang('编辑客户端失败, 原因: ', 'Edit Client failed, reason: ') + msg);
        }
        this.setState({formSubmitting: false});
    }

    show ({client, path}){
        if (!client.path){
            client.path = path;
        }
        this.setState({
            visible: true,
            clientData: client
        });
    }

    async hide (){
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
                title={lang('编辑客户端', 'Edit Client')}
                width={540}
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
                            loading={this.state.formSubmitting}
                            onClick={this.edit.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item {...formItemLayout} label={lang('类型', 'Type')}>
                        {lang('主机', 'Host')}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('主机名/IP', 'hostname/IP')}>
                        {this.state.clientData.ip}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('权限', 'Permission')}>
                        <Select
                            style={{width: isChinese ? 300 : 280}}
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
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditClient);