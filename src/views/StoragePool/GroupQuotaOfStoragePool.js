import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {Button, Table, Modal, Popover, message} from 'antd';
import SetGroupQuotaOfStoragePool from './SetGroupQuotaOfStoragePool';
import {formatStorageSize} from 'Services';

class GroupQuotaOfStoragePool extends Component {
	constructor (props){
		super(props);
		this.state = {
			visible: false,
			poolId: '',
			poolName: '',
            batchDeleteNames: []
		};
	}

	setQuota (groupQuota){
	    let {poolId, poolName} = this.state;
        this.setGroupQuotaOfStoragePoolWrapper.getWrappedInstance().show(groupQuota, {poolId, poolName});
    }

	delete (groupQuota){
	    let {poolId, poolName} = this.state;
		const modal = Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行删除本地认证用户组 ${groupQuota.name} 在存储池 ${poolName} 中的配额的操作。`, `You are about to delete the quota of local authentication user group ${groupQuota.name} from storage pool ${poolName}.`)}</p>
				<p>{lang(`该操作将会使本地认证用户组 ${groupQuota.name} 在存储池 ${poolName} 中的配额重置为无限制的初始状态，不会影响该用户组在该存储池中已写入的数据。`, `This operation will reset the quota of local authenticated user group ${groupQuota.name} in ${poolName} to an unlimited state without affecting the data that the group has written in the storage pool.`)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的本地认证用户组和存储池，并且该用户在该存储池下确实已不需要做配额限制。`, `A suggestion: before executing this operation, ensure that you select the right local authentication user group and it's not to be limited any more in this storage pool.`)}</p>
			</div>,
			keyboard: false,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
				try {
					await httpRequests.deleteGroupQuotaFromStoragePool({poolId, names: [groupQuota.name]});
					httpRequests.getGroupQuotasOfStoragePoolById(poolId);
					message.success(lang(`删除本地认证用户组 ${groupQuota.name} 在存储池 ${poolName} 中的配额成功!`, `Delete the quota of local authentication user group ${groupQuota.name} from storage pool ${poolName} successfully!`));
				} catch ({msg}){
					message.error(lang(`删除本地认证用户组 ${groupQuota.name} 在存储池 ${poolName} 中的配额失败, 原因: `, `Delete the quota of local authentication user group ${groupQuota.name} from storage pool ${poolName} failed, reason: `) + msg);
				}
                modal.update({cancelButtonProps: {disabled: false}});
			},
			onCancel: () => {

			}
		});
	}

	batchDelete (){
		let {poolId, poolName, batchDeleteNames} = this.state;
		const modal = Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行删除本地认证用户组 ${batchDeleteNames.join('、')} 在存储池 ${poolName} 中的配额的操作。`, `You are about to delete the quota of local authentication user groups ${batchDeleteNames.join('、')} from storage pool ${poolName}.`)}</p>
				<p>{lang(`该操作将会使这些本地认证用户组在存储池 ${poolName} 中的配额重置为无限制的初始状态，不会影响这些用户组在该存储池中已写入的数据`, `This operation will reset the quota of these local authenticated user groups in ${poolName} to an unlimited state without affecting the data that the groups have written in the storage pool.`)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的本地认证用户组和存储池，并且这些用户在该存储池下确实已不需要做配额限制。`, `A suggestion: before executing this operation, ensure that you select the right local authentication user groups and they are not to be limited any more in this storage pool.`)}</p>
			</div>,
			keyboard: false,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
				try {
					await httpRequests.deleteGroupQuotaFromStoragePool({poolId, names: batchDeleteNames});
					httpRequests.getGroupQuotasOfStoragePoolById(poolId);
					message.success(lang(`批量删除 ${batchDeleteNames.length}个 本地认证用户组在存储池 ${poolName} 中的配额成功!`, `Delete the quota of ${batchDeleteNames.length} local authentication user groups from storage pool ${poolName} in batch successfully!`));
				} catch ({msg}){
					message.error(lang(`批量删除本地认证用户组在存储池 ${poolName} 中的配额失败, 原因: `, `Delete the quota of local authentication user groups from storage pool ${poolName} in batch failed, reason: `) + msg);
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
            batchDeleteNames: []
		});
		httpRequests.getGroupQuotasOfStoragePoolById(poolId);
	}

	hide (){
		this.setState({
			visible: false,
		});
	}

	render (){
		let {groupQuotasOfStoragePool} = this.props;
		let {poolName, batchDeleteNames} = this.state;
		let buttonConf = {size: 'small', shape: 'circle', style: {height: 18, width: 18, marginRight: 5}};
		let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
		let tableProps = {
			size: 'normal',
			dataSource: groupQuotasOfStoragePool,
			pagination: groupQuotasOfStoragePool.length > 5 && {
				pageSize: 5,
				showTotal: (total, range) => lang(
					`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
					`show ${range[0]}-${range[1]} of ${total} items`
				),
				size: 'normal',
			},
			rowKey: record => `${record.name}`,
			locale: {
				emptyText: lang('暂无本地认证用户组配额', 'No Quota Of Local Authentication Group')
			},
			rowSelection: {
                columnWidth: '5%',
                selectedRowKeys: batchDeleteNames,
                onChange: selectedRowKeys => this.setState({batchDeleteNames: selectedRowKeys}),
            },
			title: () => (
				<div className="fs-modal-table-title-bar">
					<Button
						style={{float: 'right'}}
                        type="danger"
                        size="small"
                        disabled={!batchDeleteNames.length}
                        onClick={this.batchDelete.bind(this)}
                    >
                        {lang('批量删除', 'Delete In Batch')}
                    </Button>
				</div>
			),
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('组名称', 'Group Name'), width: 120, dataIndex: 'name',},
				{title: lang('大小配额(已使用/配额)', 'Size Quota(Used/Quota)'), width: 150, dataIndex: 'sizeLimit',
					render: (text, record) => formatStorageSize(record.sizeUsed) + ' / ' + (text ? formatStorageSize(text) : lang('无限制', 'Unlimited'))
				},
				{title: lang('索引节点配额(已使用/配额)', 'Inode Quota(Used/Quota)'), width: 150, dataIndex: 'inodeLimit',
					render: (text, record) => formatStorageSize(record.inodeUsed) + ' / ' + (text ? formatStorageSize(text) : lang('无限制', 'Unlimited'))
				},
				{title: lang('操作', 'Operations'), width: 80,
					render: (text, record, index) => <div>
						<Popover {...buttonPopoverConf} content={lang('设置', 'Setting')}>
							<Button
								{...buttonConf}
								onClick={this.setQuota.bind(this, record, index)}
								icon="setting"
							>
							</Button>
						</Popover>
						<Popover {...buttonPopoverConf} content={lang('删除', 'Delete')}>
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
				title={lang(`存储池 ${poolName} 的本地认证用户组配额信息`,`Local Authentication Group Quota of Storage Pool ${poolName}`)}
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
                    <SetGroupQuotaOfStoragePool ref={ref => this.setGroupQuotaOfStoragePoolWrapper = ref} />
				</div>
			</Modal>
		);
	}

}

const mapStateToProps = state => {
	const {language, main: {storagePool: {groupQuotasOfStoragePool}}} = state;
	return {language, groupQuotasOfStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(GroupQuotaOfStoragePool);