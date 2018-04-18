import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Input, message, Modal, Select} from 'antd';
import lang from "../../components/Language/lang";
import httpRequests from '../../http/requests';

class CreateShare extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
            shareData: {
                path: '',
                protocol: '',
                description: ''
            },
            validation: {
                path: {status: '', help: '', valid: false},
                protocol: {status: '', help: '', valid: false}
            }
        }
    }

    formValueChange (key, value){
        let shareData = Object.assign({}, this.state.shareData, {[key]: value});
        this.setState({shareData});
    }

    async validateForm (key){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: '', help: '', valid: true}});
        await this.setState({validation});
        let {path, protocol} = this.state.shareData;
        if (key === 'path'){
            if (!path){
                await this.validationUpdateState('path', {
                    cn: '请输入要做共享的路径',
                    en: 'Please enter share path'
                }, false);
            }
        }
        if (key === 'protocol'){
            if (!protocol){
                await this.validationUpdateState('protocol', {
                    cn: '请选择一个协议',
                    en: 'Please select a protocol'
                }, false);
            }
        }
        // one path with one protocol group can only be exported once
        let share = `${path}@${protocol}`;
        let isShareDuplicated = this.props.shareList.some(({path, protocol}) => share === `${path}@${protocol}`);
        if (isShareDuplicated){
            await this.validationUpdateState('name', {
                cn: '同一路径和同一协议的组合只能做一次共享',
                en: 'One path with one protocol group can only be shared once'
            }, false);
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async validationUpdateState (key, value, valid){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: (value.cn || value.en) ? 'error' : '', help: lang(value.cn, value.en), valid: valid}});
        await this.setState({validation});
    }

    async createShare (){
        let shareData = Object.assign({}, this.state.shareData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createShare(shareData);
            httpRequests.getShareList();
            await this.hide();
            message.success(lang('创建共享成功!', 'Create share successfully!'));
            this.setState({formSubmitting: false});
        } catch ({msg}){
            message.success(lang('创建共享失败, 原因: ', 'Create share failed, reason: ') + msg);
            this.setState({formSubmitting: false});
        }
    }

    show (){
        this.setState({
            visible: true,
            formSubmitting: false,
            shareData: {
                path: '',
                protocol: ''
            },
            validation: {
                path: {status: '', help: '', valid: false},
                protocol: {status: '', help: '', valid: false}
            }
        });
    }

    hide (){
        this.setState({visible: false});
    }

    render () {
        return (
            <Modal
                title={lang('创建共享', 'Create Share')}
                    width={320}
                    closable={false}
                    maskClosable={false}
                    visible={this.state.visible}
                    footer={
                        <div>
                            <Button
                                type="primary"
                                disabled={!this.state.formValid}
                                loading={this.state.formSubmitting}
                                size='small'
                                onClick={this.createShare.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                            <Button
                                size='small'
                                onClick={this.hide.bind(this)}
                            >
                                {lang('取消', 'Cancel')}
                            </Button>
                        </div>
                    }
            >
                <Form>
                    <Form.Item
                        label={lang('共享路径', 'Share Path')}
                        validateStatus={this.state.validation.path.status}
                        help={this.state.validation.path.help}
                    >
                        <Input
                            style={{width: 240}} size="small"
                            placeholder={lang('请输入共享路径', 'please enter share path')}
                            value={this.state.shareData.path}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'path')(value);
                                this.validateForm.bind(this)('path');
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        label={lang('协议', 'Protocol')}
                        validateStatus={this.state.validation.protocol.status}
                        help={this.state.validation.protocol.help}
                    >
                        <Select
                            style={{width: 240}} size="small"
                            placeholder={lang('请选择协议', 'please select protocol')}
                            value={this.state.shareData.protocol}
                            onChange={value => {
                                this.formValueChange.bind(this, 'protocol', value)();
                                this.validateForm.bind(this)('protocol');
                            }}
                        >
                            <Select.Option value="nfs">NFS (Linux/UNIX/Mac)</Select.Option>
                            <Select.Option value="cifs">CIFS (Windows/Mac)</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label={lang('描述', 'Description')}>
                        <Input.TextArea
                            style={{width: 240}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            placeholder={lang('描述为选填项', 'description is optional')}
                            value={this.state.shareData.description}
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

const mapStateToProps = state => {
    const {language, main: {share: {shareList}}} = state;
    return {language, shareList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateShare);