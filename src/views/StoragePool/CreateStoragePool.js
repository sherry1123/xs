import React, {Component} from 'react';
import {connect} from 'react-redux';
import update from 'react-addons-update';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';
import {validateFsName} from '../../services/index';
import {Button, Modal, message, Form, Input, Select} from 'antd';

class CreateStoragePool extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            storagePoolData: {
                name: '',
				description: '',
				targets: [],
				buddymirrors:[]
            },
            validation: {
                name: {status: '', help: '', valid: false},
				description: {status: '', help: '', valid: false},
				targets: {status: '', help: '', valid: false},
				buddymirrors: {status: '', help: '', valid: false}
            }
        };
    }

	formValueChange (key, value){
		let storagePoolData = Object.assign({}, this.state.storagePoolData, {[key]: value});
		this.setState({storagePoolData});
	}

	async createStoragePool (){
		let storagePoolData = Object.assign({}, this.state.storagePoolData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.createStoragePool(storagePoolData);
			// move this operation to socket, and listen the snapshot start creating event
			httpRequests.getTargetList();
			await this.hide();
			message.success(lang(`开始创建存储池 ${storagePoolData.name}!`, `Start creating storage pool ${storagePoolData.name}!`));
		} catch ({msg}){
			message.error(lang(`存储池 ${storagePoolData.name} 创建失败, 原因: `, `Create storage pool ${storagePoolData.name} failed, reason: `) + msg);
		}
		this.setState({formSubmitting: false});
	}

	async validationUpdateState (key, value, valid){
		let obj = {validation: {}};
		obj.validation[key] = {
			status: {$set: (value.cn || value.en) ? 'error' : ''},
			help: {$set: lang(value.cn, value.en)},
			valid: {$set: valid}
		};
		let newState = update(this.state, obj);
		await this.setState(Object.assign(this.state, newState));
	}

	async validateForm (key){
		let validation = Object.assign({}, this.state.validation, {[key]: {status: '', help: '', valid: true}});
		await this.setState({validation});
		if (key === 'name'){
			let {name} = this.state.storagePoolData;
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
				let isNameDuplicated = this.props.storagePoolList.some(storagepool => storagepool.name === name);
				if (isNameDuplicated){
					// this name is duplicated with an existing storage pool's name
					await this.validationUpdateState('name', {
						cn: '该存储池名称已经存在',
						en: 'The storage pool name has already existed'
					}, false);
				}
			}
		}

		if (this.state.storagePoolData.targets){
			this.validationUpdateState('targets', {cn: '请选择存储目标', en: 'please choose storage target(s)'}, false);
		}
		if (this.state.storagePoolData.buddymirrors){
			this.validationUpdateState('buddymirrors', {cn: '请选择伙伴组镜像', en: 'please choose buddy mirror(s)'}, false);
		}
		// calculate whole form validation
		let formValid = true;
		Object.keys(this.state.validation).forEach(key => {
			formValid = formValid && this.state.validation[key].valid;
		});
		this.setState({formValid});
	}

    show (){
        this.setState({
            visible: true,
            formSubmitting: false,
			storagePoolData: {
				name: '',
				description: '',
				targets: [],
				buddymirrors:[]
			},
			validation: {
				name: {status: '', help: '', valid: false},
				description: {status: '', help: '', valid: false},
				targets: {status: '', help: '', valid: false},
				buddymirrors: {status: '', help: '', valid: false}
			}
        });
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
                title={lang('创建存储池', 'Create Storage Pool')}
                width={480}
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
                            onClick={this.createStoragePool.bind(this)}
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
							size="small"
							style={{width: '100%'}}
							placeholder={lang('请输入存储池名称', 'please enter storage pool name')}
							value={this.state.storagePoolData.name}
							onChange={({target: {value}}) => {
								this.formValueChange.bind(this, 'name')(value);
								this.validateForm.bind(this)('name');
							}}
						/>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
				   		label={lang('存储目标', 'Storage Pool Target')}
					>
						<Select
							mode="multiple"
							style={{width: '100%'}}
							placeholder={lang('请选择存储目标', 'please select storage target(s)')}
							optionLabelProp="value"
							value={this.state.storagePoolData.targets}
							onChange={(value, option) => {
								this.formValueChange.bind(this, 'targets')(value);
							}}
						>
							<Select.Option value='target_1'>target_1 /dev/xxx 500GB</Select.Option>
							<Select.Option value='target_2'>target_2 /dev/yyy 500GB</Select.Option>
							<Select.Option value='target_3'>target_3 /dev/zzz 500GB</Select.Option>
							<Select.Option value='target_4'>target_4 /dev/ttt 500GB</Select.Option>
							<Select.Option value='target_5'>target_5 /dev/eee 500GB</Select.Option>
							<Select.Option value='target_6'>target_6 /dev/hhh 500GB</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('伙伴组镜像', 'Buddy Mirror')}
					>
						<Select
							mode="multiple"
							style={{width: '100%'}}
							placeholder={lang('请选择伙伴组镜像', 'please select buddy mirror(s)')}
							optionLabelProp="value"
							value={this.state.storagePoolData.buddymirrors}
							onChange={(value, option) => {
								this.formValueChange.bind(this, 'buddymirrors')(value);
							}}
						>
							<Select.Option value='buddymirror_1'>buddymirror_1 /dev/xxx 500GB</Select.Option>
							<Select.Option value='buddymirror_2'>buddymirror_2 /dev/yyy 500GB</Select.Option>
							<Select.Option value='buddymirror_3'>buddymirror_3 /dev/zzz 500GB</Select.Option>
							<Select.Option value='buddymirror_4'>buddymirror_4 /dev/ttt 500GB</Select.Option>
							<Select.Option value='buddymirror_5'>buddymirror_5 /dev/eee 500GB</Select.Option>
							<Select.Option value='buddymirror_6'>buddymirror_6 /dev/hhh 500GB</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('描述', 'Description')}
					>
						<Input.TextArea
							size="small"
							style={{width: '100%'}}
                            autosize={{minRows: 4, maxRows: 6}}
                            placeholder={lang('描述为可选项', 'description is optional')}
                            value={this.state.storagePoolData.description}
                            maxLength={255}
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateStoragePool);