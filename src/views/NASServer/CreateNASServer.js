import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal} from 'antd';
import SelectClient from './SelectClient';
import CatalogTree from '../../components/CatalogTree/CatalogTree';
import lang from '../../components/Language/lang';
import {validateIpv4} from '../../services';
import httpRequests from '../../http/requests';

class CreateNASServer extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            NASServerData: {
                ip: '',
                path: '',
                description: ''
            },
            validation: {
                ip: {status: '', help: '', valid: false},
                path: {status: '', help: '', valid: false},
            }
        };
    }

    showClientSelect (){
        this.selectClientWrapper.getWrappedInstance().show();
    }

    async selectClient (ip){
        let NASServerData = Object.assign(this.state.NASServerData, {ip});
        await this.setState({NASServerData});
        this.validateForm('ip');
    }

    showCatalogTree (){
        let {path} = this.state.NASServerData;
        let selectedCatalog = !path ? [] : [path];
        this.catalogTreeWrapper.getWrappedInstance().show(selectedCatalog, 'NASServer');
    }

    async selectPath (path){
        let NASServerData = Object.assign(this.state.NASServerData, {path});
        await this.setState({NASServerData});
        this.validateForm('path');
    }

    formValueChange (key, value){
        let NASServerData = {[key]: value};
        NASServerData = Object.assign({}, this.state.NASServerData, NASServerData);
        this.setState({NASServerData});
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
        let {ip, path} = this.state.NASServerData;
        if (key === 'ip') {
            if (!ip) {
                this.validationUpdateState('ip', {cn: '请选择要运行该NAS服务器的客户端IP', en: 'Please select the client IP for running on'}, false);
            }
            if (!validateIpv4(ip)){
                this.validationUpdateState('ip', {cn: '该IP格式错误', en: 'This pattern of this IP is incorrect'}, false);
            }
            let NASServerIPDuplicated = this.props.NASServerList.some(NASServer => NASServer.ip === ip);
            if (NASServerIPDuplicated){
                this.validationUpdateState('ip', {cn: '该IP已被一个已存在的NAS服务器使用', en: 'This IP has been used by a existing NAS server'}, false);
            }
        }

        if (key === 'path'){
            if (!path){
                this.validationUpdateState('path', {cn: '请选择NAS服务器要管理的目录路径', en: 'Please select the catalog path that NAS server manage'}, false);
            }
            let NASServerPathDuplicated = this.props.NASServerList.some(NASServer => NASServer.path === path);
            if (NASServerPathDuplicated){
                this.validationUpdateState('path', {cn: '该路径已被其他NAS服务器管理', en: 'This path has been managed by another NAS server'}, false);
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
        let {NASServerData} = this.state;
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createNASServer(NASServerData);
            httpRequests.getNASServerList();
            await this.hide();
            message.success(lang(`创建NAS服务器成功!`, `Create NAS server successfully!`));
        } catch ({msg}){
            message.error(lang(`创建NAS服务器失败, 原因: `, `Create NAS server failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    async show (){
        await this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            NASServerData: {
                ip: '',
                path: '',
                description: ''
            },
            validation: {
                ip: {status: '', help: '', valid: false},
                path: {status: '', help: '', valid: false},
            }
        });
    }

    hide (){
        this.setState({visible: false,});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 4 : 6},
                sm: {span: isChinese ? 4 : 6},
            },
            wrapperCol: {
                xs: {span: isChinese ? 20 : 18},
                sm: {span: isChinese ? 20 : 18},
            }
        };
        let {formValid, formSubmitting, NASServerData, validation} = this.state;

        return (
            <Modal
                title={lang(`创建NAS服务器`, `Create NAS Server`)}
                width={400}
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
                            loading={formSubmitting}
                            disabled={!formValid}
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('客户端IP', 'Client IP')}
                        validateStatus={validation.ip.status}
                        help={validation.ip.help}
                    >
                        <Input
                            style={{width: isChinese ? 280 : 260}}
                            size="small"
                            readOnly
                            placeholder={lang('请选择1个客户端来运行NAS服务器', 'Please select 1 client that will run on')}
                            value={NASServerData.ip}
                            addonAfter={
                                <Icon
                                    type="laptop"
                                    style={{cursor: 'pointer'}}
                                    onClick={this.showClientSelect.bind(this)}
                                />
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('管理路径', 'Manage Path')}
                        validateStatus={validation.path.status}
                        help={validation.path.help}
                    >
                        <Input
                            style={{width: isChinese ? 280 : 260}} size="small"
                            readOnly
                            placeholder={lang('请选择NAS服务器管理的目录路径', 'Please select manage catalog path')}
                            value={NASServerData.path}
                            addonAfter={
                                <Icon
                                    type="folder-open"
                                    style={{cursor: 'pointer'}}
                                    onClick={this.showCatalogTree.bind(this)}
                                />
                            }
                        />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            style={{width: isChinese ? 280 : 260}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={200}
                            placeholder={lang('描述为选填项，长度0-200位', 'Description is optional, length is 0-200')}
                            value={NASServerData.description}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'description')(value);
                            }}
                        />
                    </Form.Item>
                </Form>
                <SelectClient ref={ref => this.selectClientWrapper= ref} onSelect={this.selectClient.bind(this)} />
                <CatalogTree ref={ref => this.catalogTreeWrapper = ref} onSelect={this.selectPath.bind(this)} />
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {share: {NASServerList}}} = state;
    return {language, NASServerList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateNASServer);