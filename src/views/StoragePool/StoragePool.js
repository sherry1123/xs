import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, Icon, Input, message, Modal, Popover, Table} from 'antd';
import EditStoragePool from './EditStoragePool';
import CreateStoragePool from './CreateStoragePool';
import TargetOfStoragePool from './TargetOfStoragePool';
import BuddyGroupOfStoragePool from './BuddyGroupOfStoragePool';
import UserQuotaOfStoragePool from './UserQuotaOfStoragePool'
import DataClassificationSetting from './DataClassificationSetting';
import GroupQuotaOfStoragePool from './GroupQuotaOfStoragePool';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    let {language, main: {storagePool: {storagePoolList}}} = state;
    return {language, storagePoolList};
};

@connect(mapStateToProps)
export default class StoragePool extends Component {
    constructor (props){
        super(props);
        let {storagePoolList} = this.props;
        this.state = {
            // table
            query: '',
            storagePoolList,
            storagePoolListBackup: storagePoolList,
        };
    }

    componentDidMount (){
         httpRequests.getStoragePoolList();
    }

    async componentWillReceiveProps (nextProps){
        let {storagePoolList} = nextProps;
        await this.setState({
			storagePoolList,
			storagePoolListBackup: storagePoolList
        });
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                storagePoolList: [...this.state.storagePoolListBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({storagePoolList: this.state.storagePoolListBackup});
        }
    }

    create (){
		this.createStoragePoolWrapper.getWrappedInstance().show();
    }

	edit (storagePoolData){
		this.editStoragePoolWrapper.getWrappedInstance().show(storagePoolData);
	}

	delete (storagePool, index){
		const modal = Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行删除存储池 ${storagePool.name}(ID: ${storagePool.poolId}) 的操作。`, `You are about to delete storage pool ${storagePool.name}(ID: ${storagePool.poolId}).`)}</p>
				<p>{lang(`该操作将会从系统中移除存储池${storagePool.name}。`, `This operation will delete storage pool ${storagePool.name} from the system. `)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的的存储池，并确认它已不再需要。`, `A suggestion: before executing this operation, ensure that you select the right storage pool and it's no longer necessary.`)}</p>
			</div>,
			keyboard: false,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
				try {
					await httpRequests.deleteStoragePool(storagePool);
					let storagePoolList = Object.assign([], this.state.storagePoolList);
					storagePoolList.splice(index, 1);
					this.setState({storagePoolList});
					message.success(lang(`存储池 ${storagePool.name} 删除成功!`, `Delete storage pool ${storagePool.name} successfully!`));
					httpRequests.getStoragePoolList();
				} catch ({msg}){
					message.error(lang(`删除存储池 ${storagePool.name} 失败, 原因: `, `Delete storage pool ${storagePool.name} failed, reason: `) + msg);
				}
                modal.update({cancelButtonProps: {disabled: false}});
			},
			onCancel: () => {

			}
		});
	}

	showStorageTargetOfStoragePool (storagePool){
		this.targetOfStoragePoolWrapper.getWrappedInstance().show(storagePool);
	}

	showBuddyGroupOfStoragePool (storagePool){
		this.buddyGroupOfStoragePoolWrapper.getWrappedInstance().show(storagePool);
	}

	showUserQuotaOfStoragePool (storagePool){
    	this.userQuotaOfStoragePoolWrapper.getWrappedInstance().show(storagePool);
	}

	showDataClassificationSetting (){
		this.dataClassificationSettingWrapper.getWrappedInstance().show();
	}

	showGroupQuotaOfStoragePoolWrapper (storagePool){
    	this.groupQuotaOfStoragePoolWrapper.getWrappedInstance().show(storagePool);
	}

    render (){
        let {storagePoolList} = this.state;
		let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {height: 18, width: 18, marginRight: 5}};
        let tableProps = {
            size: 'default',
            dataSource: storagePoolList,
            pagination: storagePoolList.length > 12 && {
                pageSize: 12,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items}`
                ),
                size: 'normal',
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无存储池', 'No Storage Pool')
            },
            title: () => (<span className="fs-table-title"><Icon type="appstore-o" />{lang('存储池', 'Storage Pool')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [
				{title: lang('ID', 'ID'), width: 100, dataIndex: 'poolId',},
                {title: lang('名称', 'Name'), width: 150, dataIndex: 'name',},
				{title: lang('数据分级', 'Data Classification'), width: 150, dataIndex: 'dataClassification',},
				{title: lang('描述', 'Description'), width: 150, dataIndex: 'description',
					render: text => text || '--'
				},
				{
					title: lang('操作', 'Operations'), width: 150,
					render: (text, record, index) => <div>
						<Popover {...buttonPopoverConf} content={lang('编辑', 'Edit')}>
							<Button
								{...buttonConf}
								onClick={this.edit.bind(this, record, index)}
								icon="edit"
							>
							</Button>
						</Popover>
						<Popover {...buttonPopoverConf} content={lang('存储目标', 'Storage Target')}>
							<Button
								{...buttonConf}
								onClick={this.showStorageTargetOfStoragePool.bind(this, record, index)}
								icon="hdd"
							>
							</Button>
						</Popover>
						<Popover {...buttonPopoverConf} content={lang('伙伴组镜像', 'Buddy Group')}>
							<Button
								{...buttonConf}
								onClick={this.showBuddyGroupOfStoragePool.bind(this, record, index)}
								icon="copy"
							>
							</Button>
						</Popover>
						<Popover {...buttonPopoverConf} content={lang('用户配额', 'User Quota')}>
							<Button
								{...buttonConf}
								onClick={this.showUserQuotaOfStoragePool.bind(this, record, index)}
								icon="user"
							>
							</Button>
						</Popover>
						<Popover {...buttonPopoverConf} content={lang('用户组配额', 'Group Quota')}>
							<Button
								{...buttonConf}
								icon="team"
								onClick={this.showGroupQuotaOfStoragePoolWrapper.bind(this, record, index)}
							>
							</Button>
						</Popover>
						<Popover {...buttonPopoverConf} content={lang('刪除', 'Delete')}>
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
			<div className="fs-page-content">
                <div className="fs-table-operation-wrapper">
					<Input.Search
						size="small"
						placeholder={lang('存储池名称', 'Storage Name')}
						value={this.state.query}
						onChange={this.queryChange.bind(this)}
						onSearch={this.searchInTable.bind(this)}
					/>
                    <div className="fs-table-operation-button-box">
                        <Button
                            type="primary"
                            size="small"
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
						<Button
                            type="warning"
                            size="small"
                            onClick={this.showDataClassificationSetting.bind(this)}
                        >
                            {lang('数据分级', 'Data Classification')}
                        </Button>
                    </div>
                </div>
				<div className="fs-main-content-wrapper">
					<Table {...tableProps} />
				</div>
				<CreateStoragePool ref={ref => this.createStoragePoolWrapper = ref} />
				<EditStoragePool ref={ref => this.editStoragePoolWrapper = ref} />
				<TargetOfStoragePool ref={ref => this.targetOfStoragePoolWrapper = ref} />
				<BuddyGroupOfStoragePool ref={ref => this.buddyGroupOfStoragePoolWrapper = ref} />
				<UserQuotaOfStoragePool ref={ref => this.userQuotaOfStoragePoolWrapper = ref} />
				<DataClassificationSetting ref={ref => this.dataClassificationSettingWrapper = ref} />
				<GroupQuotaOfStoragePool ref={ref => this.groupQuotaOfStoragePoolWrapper = ref} />
			</div>
        );
    }
}