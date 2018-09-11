import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Table, Modal} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class StoragePoolTarget extends Component {
	constructor (props){
		super(props);
		let {buddyGroupsOfStoragePool} = this.props;
		this.state = {
			visible: false,
			poolId: '',
			poolName: '',
			// table
			buddyGroupsOfStoragePool,
		};
	}

	show ({poolId, name}){
		this.setState({
			visible: true,
			poolId,
			poolName: name,
		});
	}

	hide (){
		this.setState({
			visible: false,
		});
	}

	render (){
		let {buddyGroupsOfStoragePool, poolName} = this.state;
		let tableProps = {
			size: 'normal',
			dataSource: buddyGroupsOfStoragePool,
			rowKey: record => `${record.targetId}-${record.service}`,
			locale: {
				emptyText: lang('暂无伙伴组镜像', 'No Buddy Group')
			},
			title: () => (
				<div className="fs-modal-table-title-bar">
					<Button
						size='small'
						style={{float: 'right'}}
						onClick={this.hide.bind(this)}
					>
						{lang('添加', 'Add')}
					</Button>
				</div>
			),
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('伙伴组镜像 ID', 'Buddy Group ID'), width: 150, dataIndex: 'buddyGroupId',},
				{title: lang('路径', 'Path'), width: 200, dataIndex: 'mountPath',},
				{title: lang('容量', 'Capacity'), width: 100, dataIndex: 'space'},
				{title: lang('操作', 'Operations'), width: 150, dataIndex: 'Operations'}
			],
		};
		return (
			<Modal
				width={800}
				title={lang(`存储池 ${poolName} 的伙伴组信息`, `Buddy Groups of Storage Pool ${poolName}`)}
				closable={false}
				maskClosable={false}
				visible={this.state.visible}
				afterClose={this.close}
				footer={
					<div>
						<Button
							size='small'
							onClick={this.hide.bind(this)}
						>
							{lang('取消', 'Cancel')}
						</Button>
					</div>
				}
			>
				<div className="fs-page-content">
					<div className="fs-main-content-wrapper">
						<Table {...tableProps} />
					</div>
				</div>
			</Modal>
		);
	}
}

const mapStateToProps = state => {
	const {language, main: {storagePool: {buddyGroupsOfStoragePool}}} = state;
	return {language, buddyGroupsOfStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(StoragePoolTarget);