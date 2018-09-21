import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, message, Form, Icon, Input, Select} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';
import {formatStorageSize, validateFsName} from 'Services';

class CreateStoragePool extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
			dataPreparing: true,
            storagePoolData: {
                name: '',
				description: '',
				targets: [],
				buddyGroups:[]
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

	async createStoragePool (){
		let storagePoolData = Object.assign({}, this.state.storagePoolData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.createStoragePool(storagePoolData);
			httpRequests.getStoragePoolList();
			await this.hide();
			message.success(lang(`开始创建存储池 ${storagePoolData.name}!`, `Start creating storage pool ${storagePoolData.name}!`));
		} catch ({msg}){
			message.error(lang(`存储池 ${storagePoolData.name} 创建失败, 原因: `, `Create storage pool ${storagePoolData.name} failed, reason: `) + msg);
		}
		this.setState({formSubmitting: false});
	}

    async show (){
        this.setState({
            visible: true,
			formValid: false,
            formSubmitting: false,
			dataPreparing: true,
			storagePoolData: {
				name: '',
				description: '',
				targets: [],
				buddyGroups:[]
			},
			validation: {
				name: {status: '', help: '', valid: false},
			}
        });
        await httpRequests.getTargetsOfStoragePoolById();
		await httpRequests.getBuddyGroupsOfStoragePoolById();
		this.setState({dataPreparing: false});
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
		let {targetsForStoragePool, buddyGroupsForStoragePool} = this.props;
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
				title={
                    <span>
                        {lang('创建存储池', 'Create Storage Pool')}
                        {this.state.dataPreparing && <Icon type="loading" style={{marginLeft: 10}} />}
                    </span>
                }
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
							disabled={!this.state.formValid}
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
							size="small"
							mode="multiple"
							style={{width: '100%'}}
							placeholder={lang('请选择存储目标', 'please select storage target(s)')}
							optionLabelProp="value"
							value={this.state.storagePoolData.targets}
							onChange={(value) => {
								this.formValueChange.bind(this, 'targets')(value);
							}}
						>
							{
								targetsForStoragePool.map((target, i) => <Select.Option key={i} value={target.id}>ID: {target.id} {lang('容量', 'Capacity:')} {formatStorageSize(target.capacity)} {lang('路径:', 'Path:')} {target.targetPath} </Select.Option>)
							}
						</Select>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('伙伴组镜像', 'Buddy Group')}
					>
						<Select
							size="small"
							mode="multiple"
							style={{width: '100%'}}
							placeholder={lang('请选择伙伴组镜像', 'please select buddy group(s)')}
							optionLabelProp="value"
							value={this.state.storagePoolData.buddyGroups}
							onChange={(value, option) => {
								this.formValueChange.bind(this, 'buddyGroups')(value);
							}}
						>
							{
								buddyGroupsForStoragePool.map((group, i) => <Select.Option key={i} value={group.id}>ID: {group.id} {lang('容量:', 'Capacity:')} {formatStorageSize(group.capacity)}</Select.Option>)
							}
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
    let {language, main: {storagePool: {storagePoolList, targetsForStoragePool, buddyGroupsForStoragePool}}} = state;
    return {language, storagePoolList, targetsForStoragePool, buddyGroupsForStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateStoragePool);