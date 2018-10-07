import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {Button, Table, Modal, message, Popover} from 'antd';
import AddTargetToStoragePool from './AddTargetToStoragePool';
import AddDiskToTarget from './AddDiskToTarget';

class TargetOfStoragePool extends Component {
	constructor (props){
		super(props);
		this.state = {
			visible: false,
			poolName: '',
		};
	}

	delete (storagePoolTarget, index){
		Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行从存储池 ${this.state.poolName} 移除存储目标 ID:${storagePoolTarget.id} 的操作。`, `You are about to remove target ID:${storagePoolTarget.id} from storage pool ${this.state.poolName}.`)}</p>
				<p>{lang(`该操作将会从存储池 ${this.state.poolName} 中移除存储目标 ID:${storagePoolTarget.id}，将会导致该存储池的容量减少，并且。`, `This operation will delete target ID:${storagePoolTarget.id} from storage pool ${this.state.poolName}. `)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的的存储目标，并确认该存储池它已不再需要它。`, `A suggestion: before executing this operation, ensure that you select the right target and it's no longer necessary.`)}</p>
			</div>,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
				try {
					await httpRequests.deleteStoragePool(storagePoolTarget);
					let targetsOfStoragePool = Object.assign([], this.state.targetsOfStoragePool);
					targetsOfStoragePool.splice(index, 1);
					this.setState({targetsOfStoragePool});
					message.success(lang(`已开始删除存储池目标 ID:${storagePoolTarget.id}!`, `Start deleting storage pool ${storagePoolTarget.id}!`));
				} catch ({msg}){
					message.error(lang(`删除存储池目标 ID:${storagePoolTarget.id} 失败, 原因: `, `Delete storage pool target ${storagePoolTarget.id} failed, reason: `) + msg);
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
		httpRequests.getTargetsOfStoragePoolById(poolId);
	}

	hide (){
		this.setState({
			visible: false,
		});
	}

	addTargetToStoragePool (){
		this.addTargetToStoragePoolWrapper.getWrappedInstance().show(this.state.poolName);
	}

	addDiskToTarget (storagePoolTarget){
		this.addDiskToTargetWrapper.getWrappedInstance().show(storagePoolTarget);
	}

	render (){
		let {targetsOfStoragePool} = this.props;
		let {poolName} = this.state;
		let buttonConf = {size: 'small', shape: 'circle', style: {height: 18, width: 18, marginRight: 5}};
		let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
		let tableProps = {
			size: 'normal',
			dataSource: targetsOfStoragePool,
			pagination: targetsOfStoragePool.length > 12 && {
				pageSize: 12,
				showTotal: (total, range) => lang(
					`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
					`show ${range[0]}-${range[1]} of ${total} items`
				),
				size: 'normal',
			},
			rowKey: record => `${record.targetId}-${record.service}`,
			locale: {
				emptyText: lang('暂无存储目标', 'No Storage Target')
			},
			title: () => (<div className="fs-modal-table-title-bar">
				<Button
					size='small'
					style={{float: 'right'}}
					onClick={this.addTargetToStoragePool.bind(this)}
				>
					{lang('添加', 'Add')}
				</Button>
			</div>
			),
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('ID', 'ID'), width: 100, dataIndex: 'id',},
				{title: lang('路径', 'Mount Path'), width: 220, dataIndex: 'targetPath',},
				{title: lang('容量', 'Capacity'), width: 170, dataIndex: 'capacity'},
				{title: lang('操作', 'Operations'), width: 170,
					render: (text, record, index) => <div>
						<Popover {...buttonPopoverConf} content={lang('加盘', 'Add')}>
							<Button
								{...buttonConf}
								onClick={this.addDiskToTarget.bind(this, record, index)}
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
						<AddDiskToTarget ref={ref => this.addDiskToTargetWrapper = ref} />
					</div>
				}
			],
		};
		return (
			<Modal
				width={800}
				title={lang(`存储池 ${poolName} 的存储目标信息`,`Storage Target of Storage Pool ${poolName}`)}
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
					<AddTargetToStoragePool ref={ref => this.addTargetToStoragePoolWrapper = ref} />
				</div>
			</Modal>
		);
	}

}

const mapStateToProps = state => {
	const {language, main: { storagePool: {targetsOfStoragePool}}} = state;
	return {language, targetsOfStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(TargetOfStoragePool);