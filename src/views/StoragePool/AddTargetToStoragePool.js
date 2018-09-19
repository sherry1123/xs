import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';
import {formatStorageSize} from 'Services';
import {Button, Modal, Form, Select} from 'antd';
import {message} from "antd/lib/index";

class AddTargetToStoragePool extends Component {
	constructor (props){
		super(props);
		this.state = {
			poolName: '',
			visible: false,
			formValid: false,
			formSubmitting: false,
			targetData: {
				name: '',
				targets: [],
			},
			validation: {
				name: {status: '', help: '', valid: false},
				targets: {status: '', help: '', valid: false},
			}
		};
	}

	formValueChange (key, value){
		let targetData = Object.assign({}, this.state.targetData, {[key]: value});
		this.setState({targetData});
	}

	show (poolName){
		this.setState({
			visible: true,
			poolName,
			targetData: {
				name: '',
				targets: [],
			},
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
			httpRequests.getTargetsOfStoragePoolById();
			await this.hide();
			message.success(lang(`开始添加存储目标 ${targetData.name}!`, `Start adding storage target ${targetData.name} !`));
		} catch ({msg}){
			message.error(lang(`存储目标 ${targetData.name} 添加失败, 原因: `, `Add storage target failed, reason: `) + msg);
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
				title={lang(`为存储池 ${this.state.poolName} 添加存储目标`, `Add New Storage Target for ${this.state.poolName} `)}
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
							placeholder={lang('请选择存储目标', 'please select storage target(s)')}
							optionLabelProp="value"
							value={this.state.targetData.targets}
							onChange={(value, option) => {
								this.formValueChange.bind(this, 'targets')(value);
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

const mapStateToProps = state => {
	let {language, main: {storagePool: {storagePoolList, targetsForStoragePool}}} = state;
	return {language, storagePoolList, targetsForStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(AddTargetToStoragePool);