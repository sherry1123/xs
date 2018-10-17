import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, Form, message, Select} from 'antd';
import lang from 'Components/Language/lang';
import {debounce, validationUpdateState, formatStorageSize} from 'Services';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
	let {language, main: {storagePool: {storagePoolList, targetsForStoragePool}}} = state;
	return {language, storagePoolList, targetsForStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
@validationUpdateState(lang)
export default class AddTargetToStoragePool extends Component {
	constructor (props){
		super(props);
		this.state = {
			visible: false,
			formValid: false,
			formSubmitting: false,
			poolName: '',
			targetData: {
				poolId: '',
				targets: [],
			},
			validation: {
				targets: {status: '', help: '', valid: false},
			}
		};
	}

	formValueChange (key, value){
		let targetData = Object.assign({}, this.state.targetData, {[key]: value});
		this.setState({targetData});
	}

	@debounce(500)
	async validateForm (key){
		await this.validationUpdateState(key, {cn: '', en: ''}, true);
		let {targets} = this.state.targetData;
		if (key === 'targets'){
			if (!targets.length){
				await this.validationUpdateState('targets', {
					cn: '请至少选择一个存储目标',
					en: 'Please select one target at least'
				}, false);
			}
		}

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
			targetData: {
				poolId,
				targets: [],
			},
			validation: {
				targets: {status: '', help: '', valid: false},
			}
		});
		httpRequests.getTargetsOfStoragePoolById();
	}

	async hide (){
		this.setState({visible: false});
	}

	async addTargetToStoragePool (){
		let targetData = Object.assign({}, this.state.targetData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.addTargetToStoragePool(targetData);
			httpRequests.getTargetsOfStoragePoolById(targetData.poolId);
			await this.hide();
			message.success(lang(`为存储池 ${this.state.poolName} 添加存储目标成功!`, `Add target(s) to storage pool ${this.state.poolName} successfully!`));
		} catch ({msg}){
			message.error(lang(`为存储池 ${this.state.poolName} 添加存储目标失败!, 原因: `, `Add target(s) to storage pool ${this.state.poolName} failed, reason: `) + msg);
		}
		this.setState({formSubmitting: false});
	}

	render (){
		let {targetsForStoragePool } = this.props;
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
				title={lang(`为存储池 ${this.state.poolName} 添加存储目标`, `Add New Storage Target for Storage Pool ${this.state.poolName} `)}
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
							onClick={this.addTargetToStoragePool.bind(this)}
						>
							{lang('添加', 'Add')}
						</Button>
					</div>
				}
			>
				<Form>
					<Form.Item
						{...formItemLayout}
						label={lang('存储目标', 'Storage Pool Target')}
					>
						<Select
							size="small"
							mode="multiple"
							style={{width: '100%'}}
							placeholder={lang('请选择存储目标', 'Please select storage target(s)')}
							optionLabelProp="value"
							value={this.state.targetData.targets}
							onChange={(value) => {
								this.formValueChange.bind(this, 'targets')(value);
								this.validateForm.bind(this)('targets');
							}}
						>
							{
								targetsForStoragePool.map((target, i) => <Select.Option key={i} value={target.id}>{target.id} {target.targetPath} {formatStorageSize(target.capacity)}</Select.Option>)
							}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}