import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {Button, Table, Modal, Popover, message} from 'antd';
import AddBuddyGroupToStoragePool from './AddBuddyGroupToStoragePool';

class BuddyGroupOfStoragePool extends Component {
	constructor (props){
		super(props);
		this.state = {
			visible: false,
			poolName: '',
		};
	}

	delete (storageBuddyGroup, index){
		Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行从存储池 ${this.state.poolName} 移除伙伴组镜像 ID:${storageBuddyGroup.id} 的操作。`, `You are about to remove storage pool buddy group ID:${storageBuddyGroup.id} from storage pool ${this.state.poolName}.`)}</p>
				<p>{lang(`该操作将会从存储池 ${this.state.poolName} 中移除伙伴组镜像 ID:${storageBuddyGroup.id}，将会导致该存储池的容量减少，并且。`, `This operation will delete storage pool buddy group ID:${storageBuddyGroup.id} from storage pool ${this.state.poolName}. `)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的的伙伴组镜像，并确认该存储池它已不再需要它。`, `A suggestion: before executing this operation, ensure that you select the right storage pool and it's no longer necessary.`)}</p>
			</div>,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
				try {
					await httpRequests.deleteStoragePool(storageBuddyGroup);
					let buddyGroupsOfStoragePool = Object.assign([], this.state.buddyGroupsOfStoragePool);
					buddyGroupsOfStoragePool.splice(index, 1);
					this.setState({buddyGroupsOfStoragePool});
					message.success(lang(`已开始删除伙伴组镜像 ID:${storageBuddyGroup.id}!`, `Start deleting storage pool buddy group ID:${storageBuddyGroup.id}!`));
				} catch ({msg}){
					message.error(lang(`删除伙伴组镜像 ID:${storageBuddyGroup.id} 失败, 原因: `, `Delete storage pool buddy group ID:${storageBuddyGroup.id} failed, reason: `) + msg);
				}
			},
			onCancel: () => {

			}
		});
	}

	show ({poolId, name}){
		this.setState({
			visible: true,
			poolId,
			poolName: name,
		});
		httpRequests.getBuddyGroupsOfStoragePoolById(poolId);
	}

	hide (){
		this.setState({
			visible: false,
		});
	}

	addBuddyGroup (storageBuddyGroup){
		this.addBuddyGroupToStorageWrapper.getWrappedInstance().show(this.state.poolName);
	}

	render (){
		let {buddyGroupsOfStoragePool} = this.props;
		let {poolName} = this.state;
		let buttonConf = {size: 'small', shape: 'circle', style: {height: 18, width: 18, marginRight: 5}};
		let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
		let tableProps = {
			size: 'normal',
			dataSource: buddyGroupsOfStoragePool,
			pagination: buddyGroupsOfStoragePool.length > 12 && {
				pageSize: 12,
				showTotal: (total, range) => lang(
					`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
					`show ${range[0]}-${range[1]} of ${total} items`
				),
				size: 'normal',
			},
			rowKey: record => `${record.targetId}-${record.service}`,
			locale: {
				emptyText: lang('暂无伙伴组镜像', 'No Storage Target')
			},
			title: () => (
				<div className="fs-modal-table-title-bar">
					<Button
						size='small'
						style={{float: 'right'}}
						onClick={this.addBuddyGroup.bind(this)}
					>
						{lang('添加', 'Add')}
					</Button>
					<AddBuddyGroupToStoragePool ref={ref => this.addBuddyGroupToStorageWrapper = ref} />
				</div>
			),
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('ID', 'ID'), width: 100, dataIndex: 'id',},
				{title: lang('路径', 'Mount Path'), width: 220, dataIndex: 'targetPath',},
				{title: lang('容量', 'Capacity'), width: 170, dataIndex: 'capacity'},
				{title: lang('操作', 'Operations'), width: 170,
					render: (text, record, index) =>
						<div>
							<Popover {...buttonPopoverConf} content={lang('加盘', 'Add')}>
								<Button
									{...buttonConf}
									//onClick={this.Add.bind(this, record, index)}
									icon="edit"
								>
								</Button>
							</Popover>
							<Popover {...buttonPopoverConf} content={lang('移除', 'Remove')}>
								<Button
									{...buttonConf}
									onClick={this.delete.bind(this, record, index)}
									icon="delete"
								>
								</Button>
							</Popover>
						</div>
				}
			],
		};
		return (
			<Modal
				width={800}
				title={lang(`存储池 ${poolName} 的伙伴组镜像信息`,`Buddy Group of Storage Pool ${poolName}`)}
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
	const {language, main: { storagePool: {buddyGroupsOfStoragePool}}} = state;
	return {language, buddyGroupsOfStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(BuddyGroupOfStoragePool);