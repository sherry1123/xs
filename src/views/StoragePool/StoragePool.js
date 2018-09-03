import React, {Component} from 'react';
import {connect} from 'react-redux';
import CreateStoragePool from './CreateStoragePool';
import EditStoragePool from './EditStoragePool';
import lang from 'Components/Language/lang';
import httpRequests from "../../http/requests";
import {getCapacityColour} from "../../services";
import {Button, Icon, Input, Popover, Table} from 'antd';
import {message, Modal} from "antd/lib/index";

class StoragePool extends Component {
	constructor (props){
		super(props);
		let {storagepoolList} = this.props;
		this.state = {
			// table
			storagepoolList,
			storagepoolListBackup: storagepoolList,
		};
	}

	componentDidMount (){
		//httpRequests.getList();
	}

	async componentWillReceiveProps (nextProps){
		let {storagepoolList} = nextProps;
		await this.setState({storagepoolList, storagepoolListBackup: storagepoolList});
	}

	create (){
		this.createStoragepoolWrapper.getWrappedInstance().show();
	}

	edit (storagePoolData){
		this.editStoragepoolWrapper.getWrappedInstance().show(storagePoolData);
	}

	delete (storagepool){
		Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行删除存储池 ${storagepool.name} 的操作。`, `You are about to delete storage pool ${storagepool.name}.`)}</p>
				<p>{lang(`该操作将会从系统中删除该存储池。`, `This operation will delete this storage pool from the system. `)}</p>
				<p>{lang(`建议：在执行该操作前先确保您选择的存储池是否正确，并确认它已不再需要。`, `A suggestion: before executing this operation, ensure that you select the right storage pool and it's no longer necessary.`)}</p>
			</div>,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
				try {
					await httpRequests.deleteSnapshot(storagepool);
					httpRequests.getSnapshotList();
					message.success(lang(`已开始删除存储池 ${storagepool.name}!`, `Start deleting storage pool ${storagepool.name}!`));
				} catch ({msg}){
					message.error(lang(`删除存储池 ${storagepool.name} 失败, 原因: `, `Delete storage pool ${storagepool.name} failed, reason: `) + msg);
				}
			},
			onCancel: () => {

			}
		});
	}

    render (){
		let {storagepoolList} = this.state;
		let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
		let buttonConf = {size: 'small', shape: 'circle', style: {height: 18, width: 18, marginRight: 5}};
		let storagepoolHandling = storagepoolList.some(storagepool => storagepool.creating || storagepool.deleting );
		let tableProps = {
			size: 'normal',
			dataSource: storagepoolList,
			pagination: {
				pageSize: 12,
				showTotal: (total, range) => lang(
					`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
					`show ${range[0]}-${range[1]} of ${total} items`
				),
				size: 'normal',
			},
			rowKey: record => `${record.targetId}-${record.service}`,
			locale: {
				emptyText: lang('暂无存储池', 'No Storage Pool')
			},
			title: () => (<span className="fs-table-title"><Icon type="save" />{lang('存储池', 'Storage Pool')}</span>),
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('名称', 'Name'), width: 200, dataIndex: 'name',},
				{
					title: lang('操作', 'Description'), width: 100,
					render: (text, record, index) => {
						return (!record.creating && !record.deleting) ?
							<div>
								<Popover {...buttonPopoverConf} content={lang('编辑', 'Edit')}>
									<Button
										{...buttonConf}
										disabled={storagepoolHandling}
										onClick={this.edit.bind(this, record)}
										icon="edit"
									/>
								</Popover>
								<Popover {...buttonPopoverConf} content={lang('删除', 'Delete')}>
									<Button
										{...buttonConf}
										disabled={storagepoolHandling}
										onClick={this.delete.bind(this, record)}
										icon="delete"
									/>
								</Popover>
							</div> :
							<a disabled>
								{
									record.creating ? lang('创建中', 'Creating') :
										record.deleting ? lang('删除中', 'Deleting') :''
								}
							</a>;
					}

				}
			],
		};

        return (
			<div className="fs-page-content">
                <div className="fs-table-operation-wrapper">
                    <div className="fs-table-operation-button-box">
                        <Button
                            type="primary"
                            size="small"
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                    </div>
                </div>
				<div className="fs-main-content-wrapper">
					<Table {...tableProps} />
				</div>
				<CreateStoragePool ref={ref => this.createStoragepoolWrapper = ref} />
				<EditStoragePool ref={ref => this.editStoragepoolWrapper = ref} />
            </div>

        );
    }
}

const mapStateToProps = state => {
    let {language,main: {storagepool: {storagepoolList}}} = state;
    return {language,storagepoolList};
};



export default connect(mapStateToProps)(StoragePool);