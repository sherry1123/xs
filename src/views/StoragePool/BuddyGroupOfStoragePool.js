import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {Button, Table, Modal, Popover, message} from 'antd';
import AddDiskToBuddyGroup from './AddDiskToBuddyGroup';
import AddBuddyGroupToStoragePool from './AddBuddyGroupToStoragePool';
import {formatStorageSize} from 'Services';

const mapStateToProps = state => {
	const {language, main: {storagePool: {buddyGroupsOfStoragePool}}} = state;
	return {language, buddyGroupsOfStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
export default class BuddyGroupOfStoragePool extends Component {
	constructor (props){
		super(props);
		this.state = {
			visible: false,
			poolId: '',
			poolName: '',
		};
	}

	delete (buddyGroup){
		let {poolId, poolName} = this.state;
		const modal = Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行从存储池 ${poolName} 移除伙伴组镜像 ID:${buddyGroup.id} 的操作。`, `You are about to remove storage pool buddy group ID:${buddyGroup.id} from storage pool ${poolName}.`)}</p>
				<p>{lang(`该操作将会从存储池 ${poolName} 中移除伙伴组镜像 ID:${buddyGroup.id}，将会导致该存储池的容量减少。`, `This operation will delete storage pool buddy group ID:${buddyGroup.id} from storage pool ${poolName}. `)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的的伙伴组镜像，并确认该存储池它已不再需要它。`, `A suggestion: before executing this operation, ensure that you select the right storage pool and it's no longer necessary.`)}</p>
			</div>,
			keyboard: false,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
				try {
					await httpRequests.deleteBuddyGroupFromStoragePool({poolId, buddyGroups:[buddyGroup.id]});
					httpRequests.getBuddyGroupsOfStoragePoolById(this.state.poolId);
					message.success(lang(`从存储池 ${poolName} 删除伙伴组镜像 ID:${buddyGroup.id} 成功!`, `Delete buddy group ID:${buddyGroup.id} from storage pool ${poolName} successfully!`));
				} catch ({msg}){
					message.error(lang(`从存储池 ${poolName} 删除伙伴组镜像 ID:${buddyGroup.id} 失败, 原因: `, `Delete buddy group ID:${buddyGroup.id} from storage pool ${poolName} failed, reason: `) + msg);
				}
                modal.update({cancelButtonProps: {disabled: false}});
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

	addBuddyGroupToStoragePool (){
		let {poolId, poolName} = this.state;
		this.addBuddyGroupToStorageWrapper.getWrappedInstance().show(poolId, poolName);
	}

	addDiskToBuddyGroup (buddyGroup){
		this.addDiskToBuddyGroupWrapper.getWrappedInstance().show(buddyGroup);
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
			rowKey: record => `${record.groupId}-${record.type}`,
			locale: {
				emptyText: lang('暂无伙伴组镜像', 'No Storage Target')
			},
			title: () => (
				<div className="fs-modal-table-title-bar">
					<Button
						size='small'
						style={{float: 'right'}}
						onClick={this.addBuddyGroupToStoragePool.bind(this)}
					>
						{lang('添加', 'Add')}
					</Button>
				</div>
			),
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('ID', 'ID'), width: 100, dataIndex: 'id',},
				{title: lang('路径', 'Mount Path'), width: 220, dataIndex: 'targetPath',},
				{title: lang('容量', 'Capacity'), width: 170, dataIndex: 'capacity',
					render: text => formatStorageSize(text)
				},
				{title: lang('操作', 'Operations'), width: 170,
					render: (text, record, index) => <div>
						<Popover {...buttonPopoverConf} content={lang('加盘', 'Add')}>
							<Button
								{...buttonConf}
								onClick={this.addDiskToBuddyGroup.bind(this, record, index)}
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
						<AddDiskToBuddyGroup ref={ref => this.addDiskToBuddyGroupWrapper = ref} />
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
					<AddBuddyGroupToStoragePool ref={ref => this.addBuddyGroupToStorageWrapper = ref} />
				</div>
			</Modal>
		);
	}
}