import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {validateFsName} from 'Services';
import {Button, Modal, Form, Input, message} from 'antd';

class EditStoragePool extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            storagePoolData: {
                name: '',
				description: '',
            },
            validation: {
                name: {status: '', help: '', valid: false},
            }
        };
    }

	formValueChange (key, value){
		let storagePoolData = Object.assign({}, this.state.storagePoolData, {[key]: value});
		this.setState({storagePoolData});
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
		let {name} = this.state.storagePoolData;
		if (key === 'name'){
			if (!name){
				// no name enter
				await this.validationUpdateState('name', {
					cn: '请输入存储池名称',
					en: 'please enter storage pool name'
				}, false);
			} else if (!validateFsName(name)){
				// name validate failed
				await this.validationUpdateState('name', {
					cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位）的组合，长度3-30位',
					en: 'Name can only contains letter, number and underscore(except for the first), length is 3-30'
				}, false);
			} else {
				let isNameDuplicated = this.props.storagePoolList.some(storagePool => storagePool.name === name);
				if (isNameDuplicated){
					// this name is duplicated with an existing storage pool's name
					await this.validationUpdateState('name', {
						cn: '该存储池名称已经存在',
						en: 'The storage pool name has already existed'
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

    show (storagePoolData){
        this.setState({
            visible: true,
            formSubmitting: false,
            storagePoolData,
        });
    }

	async editStoragePool (){
		let storagePool = Object.assign({}, this.state.storagePoolData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.updateStoragePool(storagePool);
			httpRequests.getStoragePoolList();
			await this.hide();
			message.success(lang(`编辑存储池 ${storagePool.name} 成功!`, `Edit Storage Pool ${storagePool.name} successfully!`));
		} catch ({msg}){
			message.error(lang(`编辑存储池 ${storagePool.name} 失败, 原因: `, `Edit Storage Pool ${storagePool.name} failed, reason: `) + msg);
		}
		this.setState({formSubmitting: false});
	}

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 5 : 7},
                sm: {span: isChinese ? 5 : 7},
            },
            wrapperCol: {
                xs: {span: isChinese ? 19 : 17},
                sm: {span: isChinese ? 19 : 17},
            }
        };
        return (
            <Modal
                title={lang('编辑存储池', 'Edit Storage Pool')}
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
							disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.editStoragePool.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
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
							size="small"
							style={{width: '100%'}}
							value={this.state.storagePoolData.name}
							onChange={({target: {value}}) => {
								this.formValueChange.bind(this, 'name')(value);
								this.validateForm.bind(this)('name');
							}}
						/>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('描述', 'Description')}
					>
						<Input.TextArea
							size="small"
							autosize={{minRows: 4, maxRows: 6}}
							placeholder={lang('描述为可选项，长度0-200位', 'description is optional, length 0-200 bits')}
							value={this.state.storagePoolData.description}
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

const mapStateToProps = state => {
    let {language, main: {storagePool: {storagePoolList}}} = state;
    return {language, storagePoolList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditStoragePool);