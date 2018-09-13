import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {Button, Table, Modal, Popover} from 'antd';
import AddTargetToStoragePool from './AddTargetToStoragePool';
import {message} from "antd/lib/index";

class ShowStoragePoolTarget extends Component {
	constructor (props){
		super(props);
		let {targetsOfStoragePool} = this.props;
		this.state = {
			visible: false,
			poolId: '',
			poolName: '',
			// table
			targetsOfStoragePool,
		};
	}

	delete (storagePool, index){
		Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行从存储池 ${storagePool.name} 移除存储目标  的操作。`, `You are about to remove storage target from storage pool ${storagePool.name}.`)}</p>
				<p>{lang(`该操作将会从存储池${storagePool.name}中移除  ，将会导致该存储池的容量减少，并且。`, `This operation will delete storage pool ${storagePool.name} from the system. `)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的的存储目标，并确认该存储池它已不再需要它。`, `A suggestion: before executing this operation, ensure that you select the right storage pool and it's no longer necessary.`)}</p>
			</div>,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
				try {
					await httpRequests.deleteStoragePool(storagePool);
					let storagePoolList = Object.assign([], this.state.storagePoolList);
					storagePoolList.splice(index, 1);
					this.setState({storagePoolList});
					message.success(lang(`已开始删除存储池 ${storagePool.name}!`, `Start deleting storage pool ${storagePool.name}!`));
				} catch ({msg}){
					message.error(lang(`删除快照 ${storagePool.name} 失败, 原因: `, `Delete storage pool ${storagePool.name} failed, reason: `) + msg);
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
	}

	hide (){
		this.setState({
			visible: false,
		});
	}

	addNewTarget (storageTarget){
		this.addTargetToStoragePoolWrapper.getWrappedInstance().show(storageTarget);
	}


	render (){
		let {targetsOfStoragePool, poolName} = this.state;
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
					onClick={this.addNewTarget.bind(this)}
				>
					{lang('添加', 'Add')}
				</Button>
				<AddTargetToStoragePool ref={ref => this.addTargetToStoragePoolWrapper = ref} />
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
									//onClick={this..bind(this, record, index)}
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(ShowStoragePoolTarget);