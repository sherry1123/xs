import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Input, message, Modal} from 'antd';
import lang from 'Components/Language/lang';
import {debounce, validationUpdateState, validateFsName} from 'Services';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    const {language, main: {snapshot: {snapshotList}}} = state;
    return {language, snapshotList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
@validationUpdateState(lang)
export default class CreateSnapshot extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            snapshotData: {
                name: '',
                description: ''
            },
            validation: {
                name: {status: '', help: '', valid: false}
            }
        };
    }

    formValueChange (key, value){
        let snapshotData = Object.assign({}, this.state.snapshotData, {[key]: value});
        this.setState({snapshotData});
    }

    @debounce(500)
    async validateForm (key){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: '', help: '', valid: true}});
        await this.setState({validation});
        if (key === 'name'){
            let {name} = this.state.snapshotData;
            if (!name){
                // no name enter
                await this.validationUpdateState('name', {
                    cn: '请输入快照名称',
                    en: 'Please enter snapshot name'
                }, false);
            } else if (!validateFsName(name)){
                // name validate failed
                await this.validationUpdateState('name', {
                    cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位）的组合，长度3-30位',
                    en: 'Name can only contains letter, number and underscore(except for the first), length is 3-30'
                }, false);
            } else {
                let isNameDuplicated = this.props.snapshotList.some(snapshot => snapshot.name === name);
                if (isNameDuplicated){
                    // this name is duplicated with an existing snapshot's name
                    await this.validationUpdateState('name', {
                        cn: '该快照名称已经存在',
                        en: 'The snapshot name already existed'
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

    async createSnapshot (){
        let snapshotData = Object.assign({}, this.state.snapshotData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createSnapshot(snapshotData);
            // move this operation to socket, and listen the snapshot start creating event
            // httpRequests.getSnapshotList();
            await this.hide();
            message.success(lang(`开始创建快照 ${snapshotData.name}!`, `Start creating snapshot ${snapshotData.name}!`));
        } catch ({msg}){
            message.error(lang(`快照 ${snapshotData.name} 创建失败, 原因: `, `Create snapshot ${snapshotData.name} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (){
        this.setState({
            visible: true,
            // reset form data and validations
            formSubmitting: false,
            snapshotData: {name: '', description: ''},
            validation: {name: {status: '', help: '', valid: false}}
        });
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 3 : 6},
                sm: {span: isChinese ? 3 : 6},
            },
            wrapperCol: {
                xs: {span: isChinese ? 21 : 18},
                sm: {span: isChinese ? 21 : 18},
            }
        };

        return (
            <Modal
                title={lang('创建快照', 'Create Snapshot')}
                width={400}
                visible={this.state.visible}
                closable={false}
                maskClosable={false}
                footer={
                    <div>
                        <Button
                            size='small'
                            disabled={this.state.formSubmitting}
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            type="primary"
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            size='small'
                            onClick={this.createSnapshot.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item {...formItemLayout}
                        label={lang('名称', 'Name')}
                        validateStatus={this.state.validation.name.status}
                        help={this.state.validation.name.help}
                    >
                        <Input size='small'
                            placeholder={lang('请输入快照名称', 'Please enter snapshot name')}
                            value={this.state.snapshotData.name}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'name')(value);
                                this.validateForm.bind(this)('name');
                            }}
                        />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea size='small'
                            autosize={{minRows: 4, maxRows: 6}}
                            placeholder={lang('描述为可选项，长度为0-200', 'Description is optional, length is 0-200')}
                            value={this.state.snapshotData.description}
                            maxLength={200}
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