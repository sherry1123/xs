import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';
import {formatStorageSize} from 'Services';
import {Button, Modal, message, Form, Select} from 'antd';

class AddBuddyGroupToStoragePool extends Component {
	constructor (props){
		super(props);
		this.state = {
			poolName: '',
			visible: false,
			formValid: false,
			formSubmitting: false,
			buddyGroupData: {
				name: '',
				buddyGroups:[],
			},
			validation: {
				buddyGroups: {status: '', help: '', valid: false},
			}
		};
	}

	formValueChange (key, value){
		let buddyGroupData = Object.assign({}, this.state.buddyGroupData, {[key]: value});
		this.setState({buddyGroupData});
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

		// calculate whole form validation
		let formValid = true;
		Object.keys(this.state.validation).forEach(key => {
			formValid = formValid && this.state.validation[key].valid;
		});
		this.setState({formValid});
	}

	show (poolId, poolName){
		this.setState({
			visible: true,
			formValid: false,
			formSubmitting: false,
			poolName,
			buddyGroupData: {
				poolId,
				buddyGroups:[],
			},
			validation: {
				buddyGroups: {status: '', help: '', valid: false},
			}
		});
		httpRequests.getTargetsOfStoragePoolById();
	}

	async hide (){
		this.setState({visible: false});
	}

	async addBuddyGroupToStoragePool (){
		let buddyGroupData = Object.assign({}, this.state.buddyGroupData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.addBuddyGroupToStoragePool(buddyGroupData);
			httpRequests.getBuddyGroupsOfStoragePoolById(buddyGroupData.poolId);
			await this.hide();
			message.success(lang(`为存储池 ${this.state.poolName} 添加伙伴组成功!`, `Add buddy group(s) to storage pool ${this.state.poolName} successfully!`));
		} catch ({msg}){
			message.error(lang(`为存储池 ${this.state.poolName} 添加伙伴组失败!, 原因: `, `Add buddy group(s) to storage pool ${this.state.poolName} failed, reason: `) + msg);
		}
		this.setState({formSubmitting: false});
	}

	render (){
		let {buddyGroupsForStoragePool} = this.props;
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
				title={lang(`为存储池 ${this.state.poolName} 添加伙伴组镜像`, `Add New Storage Target for Storage Pool ${this.state.poolName} `)}
				width={480}
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
							disabled={!this.state.formValid}
							loading={this.state.formSubmitting}
							onClick={this.addBuddyGroupToStoragePool.bind(this)}
						>
							{lang('添加', 'Add')}
						</Button>
					</div>
				}
			>
				<Form>
					<Form.Item
						{...formItemLayout}
						label={lang('伙伴组镜像', 'Buddy Group')}
					>
						<Select
							size="small"
							mode="multiple"
							style={{width: '100%'}}
							placeholder={lang('请选择伙伴组镜像', 'Please select buddy group(s)')}
							optionLabelProp="value"
							value={this.state.buddyGroupData.buddyGroups}
							onChange={(value) => {
								this.formValueChange.bind(this, 'buddyGroups')(value);
							}}
						>
							{
								buddyGroupsForStoragePool.map((target, i) => <Select.Option key={i} value={target.id}>{target.id} {target.targetPath} {formatStorageSize(target.capacity)}</Select.Option>)
							}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}

const mapStateToProps = state => {
	let {language, main: {storagePool: {buddyGroupsForStoragePool}}} = state;
	return {language, buddyGroupsForStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(AddBuddyGroupToStoragePool);