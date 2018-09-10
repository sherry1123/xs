import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Popover, Table, Icon, Modal} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';
import {formatStorageSize, getCapacityColour} from '../../services';

class StoragePoolTarget extends Component {
	constructor (props){
		super(props);
		let {targetList} = this.props;
		this.state = {
			visible: false,
			// table
			targetList,
			targetListBackup: targetList,
		};
	}

	async componentDidMount (){
		httpRequests.getTargetList();
	}

	show (){
		this.setState({
			visible: true,
		});
	}

	hide (){
		this.setState({
			visible: false,
		});
	}

	render (){
		let {targetList} = this.state;
		let tableProps = {
			size: 'normal',
			dataSource: targetList,
			pagination: targetList.length > 12 && {
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
			title: () => (<span className="fs-table-title"><Icon type="desktop" />{lang('存储目标', 'Storage Target')}</span>),
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('目标', 'Target ID'), width: 100, dataIndex: 'targetId',},
				{title: lang('挂载路径', 'Mount Path'), width: 220, dataIndex: 'mountPath',},
				{title: lang('容量', 'Capacity'), width: 170, dataIndex: 'space',
					render: text =>  text === '--' ? '--' : (
						<Popover
							placement="top"
							trigger='click'
							content={
								<div className="fs-target-popover-content">
									<p>{lang('总容量', 'Total Capacity')}: <span>{formatStorageSize(text.total)}</span></p>
									<p>{lang('已使用容量', 'Used Capacity')}: <span>{formatStorageSize(text.used)}</span></p>
									<p>{lang('剩余容量', 'Remaining Capacity')}: <span>{formatStorageSize(text.free)}</span></p>
									<p>{lang('容量使用率', 'Capacity Usage Rate')}: <span>{text.usage}</span></p>
								</div>
							}
						>
							<div className="fs-capacity-bar small" style={{width: 100}}>
								<div
									className="fs-capacity-used-bar"
									style={{width: text.usage > '1%' ? text.usage : '1px', background: getCapacityColour(text.usage)}}
								/>
							</div>
							<span className="fs-physical-node-capacity">{formatStorageSize(text.total)}</span>
						</Popover>
					)
				},
			],
		};
		return (
			<Modal
				   width={800}
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
	const {language, main: { target: {targetList}}} = state;
	return {language, targetList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(StoragePoolTarget);