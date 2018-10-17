import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Input, message, Modal} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
export default class EditNASServer extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: true,
            formSubmitting: false,
            NASServerData: {
                ip: '',
                path: '',
                description: ''
            },
        };
    }

    formValueChange (key, value){
        let NASServerData = {[key]: value};
        NASServerData = Object.assign({}, this.state.NASServerData, NASServerData);
        this.setState({NASServerData});
    }

    async edit (){
        let {NASServerData} = this.state;
        this.setState({formSubmitting: true});
        try {
            await httpRequests.updateNASServer(NASServerData);
            httpRequests.getNASServerList();
            await this.hide();
            message.success(lang(`编辑NAS服务器 ${NASServerData.ip} 成功!`, `Edit NAS server ${NASServerData.ip} successfully!`));
        } catch ({msg}){
            message.error(lang(`编辑NAS服务器 ${NASServerData.ip} 失败, 原因: `, `Edit NAS server ${NASServerData.ip} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    async show (NASServerData){
        await this.setState({
            visible: true,
            formValid: true,
            formSubmitting: false,
            NASServerData
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
        let {formValid, formSubmitting, NASServerData} = this.state;
        return (
            <Modal
                title={lang(`编辑NAS服务器`, `Edit NAS Server`)}
                width={400}
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
                            type="primary"
                            loading={formSubmitting}
                            disabled={!formValid}
                            onClick={this.edit.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item {...formItemLayout} label={lang('客户端IP', 'Client IP')}>
                        <span>{NASServerData.ip}</span>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('管理路径', 'Manage Path')}>
                        <span>{NASServerData.path}</span>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            style={{width: isChinese ? 280 : 260}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={200}
                            placeholder={lang('描述为选填项，长度为0-200', 'Description is optional, length is 0-200')}
                            value={NASServerData.description}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'description')(value);
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}