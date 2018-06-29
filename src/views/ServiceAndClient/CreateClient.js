import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Input, message, Modal} from 'antd';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';
import {validateIpv4} from '../../services';

class CreateClient extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            clientData: {
                ip: ''
            },
            validation: {
                ip: {status: '', help: '', valid: false},
            },
        };
    }

    formValueChange (key, value){
        let clientData = Object.assign({}, this.state.clientData, {[key]: value});
        this.setState({clientData});
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
        let {ip} = this.state.clientData;
        if (key === 'ip'){
            if (!ip) {
                this.validationUpdateState('ip', {cn: '请选择要运行该NAS服务器的客户端IP', en: 'Please select the client IP for running on'}, false);
            }
            if (!validateIpv4(ip)){
                this.validationUpdateState('ip', {cn: '该IP格式错误', en: 'This pattern of this IP is incorrect'}, false);
            }
            // since storage deep layer create a default client for its business, so can't create a new client on it again
            if (this.props.managementServerIPs.includes(ip)){
                this.validationUpdateState('ip', {cn: '该IP已被一个已存在的管理节点使用', en: 'This IP has been used by a existing management server'}, false);
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
        let clientData = Object.assign({}, this.state.clientData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createClientToCluster(clientData);
            httpRequests.getClusterServiceAndClientIPs();
            await this.hide();
            message.success(lang(`创建客户端 ${clientData.ip} 成功!`, `Create client ${clientData.ip} successfully!`));
        } catch ({msg}){
            message.error(lang(`创建客户端 ${clientData.ip} 失败, 原因: `, `Create client ${clientData.ip} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (){
        this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            clientData: {
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
        return (
            <Modal
                title={lang('创建客户端', 'Create Client IP')}
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
                    <Form.Item
                        {...formItemLayout}
                        label={lang('客户端IP', 'Client IP')}
                        validateStatus={this.state.validation.ip.status}
                        help={this.state.validation.ip.help}
                    >
                        <Input
                            style={{width: isChinese ? 280 : 260}}
                            size="small"
                            placeholder={lang('请输入客户端IP', 'Please enter client IP')}
                            value={this.state.clientData.ip}
                            onChange={({target: {value}}) => this.formValueChange.bind(this, 'ip')(value)}
                            onBlur={() => this.validateForm.bind(this)('ip')}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {dashboard: {clusterServiceAndClientIPs: {managementServerIPs, clientIPs}}}} = state;
    return {language, managementServerIPs, clientIPs};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateClient);