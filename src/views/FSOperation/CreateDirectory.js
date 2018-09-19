import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, Modal, message, Select, Spin, Popover, Switch} from 'antd';
import DirectoryTree from 'Components/DirectoryTree/DirectoryTree';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';
import {validateFsName} from 'Services';

class CreateDirectory extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
            dirData: {
                parentPath: '',
                name: '',
                noMirror: 0
            },
            validation: {
                parentPath: {status: '', help: '', valid: false},
                name: {status: '', help: '', valid: false},
            }
        };
    }

    showDirectoryTree (){
        this.directoryTreeWrapper.getWrappedInstance().show();
    }

    async selectParentPath (parentPath){
        let dirData = Object.assign(this.state.shareData, {parentPath});
        await this.setState({dirData});
        this.validateForm('parentPath');
    }

    formValueChange (key, value){
        let dirData = Object.assign({}, this.state.dirData);
        dirData[key] = value;
        this.setState({dirData});
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
        let {parentPath, name} = this.state.dirData;
        if (key === 'parentPath'){
            if (!parentPath){
                this.validationUpdateState('path', {cn: '请选择新目录的父级目录', en: 'Please select parent dir of the new dir'}, false);
            }
        }
        if (key === 'name'){
            if (!name){
                await this.validationUpdateState('name', {
                    cn: '请输入新目录名称',
                    en: 'Please enter the name of new dir'
                }, false);
            }
            if (!validateFsName(name)){
                await this.validationUpdateState('name', {
                    cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位）的组合，长度3-30位',
                    en: 'Name can only contains letter, number and underscore(except for the first), length is 3-30'
                }, false);
            }
            // 文件夹重名检测


        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async create (){
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createDirectory(this.state.dirData);
            this.hide();
            message.success(lang('创建目录成功！', 'Stripe setting has been saved successfully!'));
        } catch ({msg}){
            message.error(lang('创建目录失败，原因：', 'Stripe setting saving failed, reason: ') + msg);
        }
        this.setState({formSubmitting: false});
    }

    async show (parentPath = ''){
        await this.setState({
            visible: true,
            formSubmitting: false,
            dirData: {
                parentPath,
                name: '',
                noMirror: 0
            }
        });
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let {dirData} = this.state;
        let {language} = this.props;
        let isChinese = language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 6 : 6},
                sm: {span: isChinese ? 6 : 6},
            },
            wrapperCol: {
                xs: {span: isChinese ? 18 : 18},
                sm: {span: isChinese ? 18 : 18},
            }
        };
        return (
            <Modal
                title={lang('创建目录', 'Create Directory')}
                width={450}
                visible={this.state.visible}
                closable={false}
                maskClosable={false}
                footer={
                    <div>
                        <Button
                            size='small'
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            type="primary"
                            size='small'
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                    </div>
                }
            >
                <Form className="fs-stripe-form">
                    <Form.Item {...formItemLayout} label={lang('父级目录', 'Parent Directory')}>
                        <Input
                            size="small"
                            placeholder={lang('请选择新目录的父级目录', 'Select parent dir for this new dir')}
                            readOnly
                            value={dirData.parentPath}
                            addonAfter={
                                <Icon
                                    type="folder-open"
                                    style={{cursor: 'pointer'}}
                                    onClick={this.showDirectoryTree.bind(this)}
                                />
                            }
                        />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('新目录名称', 'New Dir Name')}>
                        <Input
                            size="small"
                            placeholder={lang('请输入新目录的名称', 'Please enter the name of new dir')}
                            value={dirData.name}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'name')(value);
                                this.validateForm.bind(this, 'name')(value);
                            }}
                        />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('伙伴组', 'Buddy Group')}>
                        <Switch
                            style={{marginRight: 10}} size="small"
                            checked={!dirData.noMirror}
                            onChange={checked => this.formValueChange.bind(this, 'noMirror')(checked + 0)}
                        />
                        {!dirData.noMirror ? lang('启用', 'Enable') : lang('不启用', 'Enable')}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('路径预览', 'Path Preview')}>
                        <span>{dirData.parentPath + '/' + dirData.name}</span>
                    </Form.Item>
                </Form>
                <DirectoryTree onSelect={this.selectParentPath.bind(this)} ref={ref => this.directoryTreeWrapper = ref} />
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateDirectory);