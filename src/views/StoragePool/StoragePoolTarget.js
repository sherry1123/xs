import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Table, Modal} from 'antd';
import lang from 'Components/Language/lang';


class StoragePoolTarget extends Component {
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
		let {targetsOfStoragePool, poolName} = this.state;
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
					onClick={this.hide.bind(this)}
				>
					{lang('添加', 'Add')}
				</Button>
			</div>
			),
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('目标', 'Target ID'), width: 100, dataIndex: 'targetId',},
				{title: lang('挂载路径', 'Mount Path'), width: 220, dataIndex: 'mountPath',},
				{title: lang('容量', 'Capacity'), width: 170, dataIndex: 'space'}
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(StoragePoolTarget);