import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
// import httpRequests from 'Http/requests';
// import {formatStorageSize} from 'Services';
import {Button, Modal, } from 'antd';

class AddDiskToTarget extends Component {
	constructor (props){
		super(props);
		this.state = {
			visible: false,
			formValid: false,
			formSubmitting: false,
			id: '',
		};
	}

	show ({id}){
		this.setState({
			visible: true,
			formValid: false,
			formSubmitting: false,
			id,
		});
	}

	async hide (){
		this.setState({visible: false});
	}

	render (){

		return (
			<Modal
				title={lang(`为存储目标 ID:${this.state.id} 添加硬盘`, `Add New Disk for Target ID:${this.state.id} `)}
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
						>
							{lang('添加', 'Add')}
						</Button>
					</div>
				}
			>
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(AddDiskToTarget);