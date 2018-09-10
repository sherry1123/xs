import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Popover, Table, Icon, Modal} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class StoragePoolTarget extends Component {
	constructor (props){
		super(props);
		let {BuddyMirrorList} = this.props;
		this.state = {
			visible: false,
			// table
			BuddyMirrorList,
			targetListBackup: BuddyMirrorList,
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
		let {BuddyMirrorList} = this.state;
		let tableProps = {
			size: 'normal',
			dataSource: BuddyMirrorList,
			rowKey: record => `${record.targetId}-${record.service}`,
			locale: {
				emptyText: lang('暂无伙伴组镜像', 'No Buddy Mirror')
			},
			title: () => (<span className="fs-table-title"><Icon type="desktop" />{lang(`存储池的伙伴组镜像的信息`, '')}</span>),
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('伙伴组镜像 ID', 'Buddy Mirror ID'), width: 150, dataIndex: 'buddymirrorid',},
				{title: lang('路径', 'Path'), width: 200, dataIndex: 'mountPath',},
				{title: lang('容量', 'Capacity'), width: 100, dataIndex: 'space'},
				{title: lang('操作', 'Operations'), width: 150, dataIndex: 'Operations'}
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
	const {language} = state;
	return {language};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(StoragePoolTarget);