import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Form, Input, message, Modal} from "antd";
import lang from "../../components/Language/lang";
import {validateFsName} from "../../services";
import httpRequests from "../../http/requests";

class CreateLocalAuthUserGroup extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            groupData: {
                name: '',
                description: '',
            },
            validation: {
                name: {status: '', help: '', valid: false},
            },
        };
    }

    formValueChange (key, value){
        let groupData = {[key]: value};
        groupData = Object.assign({}, this.state.groupData, groupData);
        this.setState({groupData});
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
        let {name} = this.state.groupData;
        if (key === 'name'){
            if (!name){
                // no name enter
                await this.validationUpdateState('name', {
                    cn: '请输入本地认证用户组名称',
                    en: 'please enter local authentication user group name'
                }, false);
            } else if (!validateFsName(name)){
                // name validate failed
                await this.validationUpdateState('name', {
                    cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位）的组合，长度3-30位',
                    en: 'Name can only contains letter, number and underscore(except for the first), length is 3-30'
                }, false);
            } else if (name === 'everyone'){
                // 'everyone' is reserved group name in system
                await this.validationUpdateState('name', {
                    cn: '"everyone"是系统的认证用户组保留名字',
                    en: '"everyone" is the reversed group name in system'
                }, false);
            } else {
                let isNameDuplicated = this.props.localAuthUserGroupList.some(group => group.name === name);
                if (isNameDuplicated){
                    // this name is duplicated with an existing snapshot's name
                    await this.validationUpdateState('name', {
                        cn: '该名称已被使用',
                        en: 'This name has already been used'
                    }, false);
                }
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
        let groupData = Object.assign({}, this.state.groupData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createLocalAuthUserGroup(groupData);
            httpRequests.getLocalAuthUserGroupList();
            await this.hide();
            message.success(lang(`创建本地认证用户组 ${groupData.name}成功!`, `Create local user authentication group ${groupData.name} successfully!`));
        } catch ({msg}){
            message.error(lang(`创建本地认证用户组 ${groupData.name} 失败, 原因: `, `Create local user authentication group ${groupData.name} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (){
        this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            groupData: {
                name: '',
                description: '',
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
                title={lang('创建本地认证用户组', 'Create Local Authentication User Group')}
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
                        label={lang('名称', 'Name')}
                        validateStatus={this.state.validation.name.status}
                        help={this.state.validation.name.help}
                    >
                        <Input
                            style={{width: isChinese ? 280 : 260}} size="small"
                            placeholder={lang('请输入本地认证用户组名称', 'Please enter the name of local authentication user group')}
                            value={this.state.groupData.name}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'name')(value);
                                this.validateForm.bind(this, 'name')();
                            }}
                        />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            style={{width: isChinese ? 280 : 260}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={200}
                            placeholder={lang('描述为选填项，长度0-200位', 'Description is optional, length is 0-200')}
                            value={this.state.groupData.description}
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
    let {language, main: {localAuthUser: {localAuthUserGroupList}}} = state;
    return {language, localAuthUserGroupList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateLocalAuthUserGroup);