import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {formatStorageSize} from 'Services';
import SetUserQuotaOfStoragePool from './SetUserQuotaOfStoragePool';
import {Button, message, Modal, Popover, Table} from "antd";
import {Input} from "antd/lib/input";

class UserQuotaOfStoragePool extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            poolId: '',
            poolName: '',
			batchDeleteNames: [],
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

	settingUserQuota (userQuotaData){
        let {poolId, poolName} = this.state;
		this.setUserQuotaOfStoragePoolWrapper.getWrappedInstance().show(poolId, poolName, userQuotaData);
    }

    delete (userQuota, index){
        const modal = Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行删除 ${userQuota.name} 在存储池 ${this.state.poolName} 中的配额的操作。`, `You are about to remove user quota ${userQuota.name} from storage pool ${this.state.poolName}.`)}</p>
				<p>{lang(`该操作将会使本地认证用户 ${userQuota.name} 中的配额重置为无限制的初始状态，但不会影响该用户在该存储池中已写入的数据。`, `This operation will . `)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的的本地认证用户和存储池，并且该用户在该存储池下确实已不需要做配额限制。`, `A suggestion: before executing this operation, ensure that you select the right user quota and storage pool, .`)}</p>
			</div>,
			keyboard: false,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
				try {
					await httpRequests.deleteUserQuotaFromStoragePool({poolId: this.state.poolId, targets: [userQuota.name]});
					httpRequests.getUserQuotaOfStoragePoolById(this.state.poolId);
					message.success(lang(`已开始删除用户配额 ${userQuota.name}!`, `Start deleting storage pool ${userQuota.name}!`));
				} catch ({msg}){
					message.error(lang(`删除用户配额 ${userQuota.name} 失败, 原因: `, `Delete storage pool target ${userQuota.name} failed, reason: `) + msg);
				}
                modal.update({cancelButtonProps: {disabled: false}});
			},
			onCancel: () => {

			}
		});
    }

    batchDelete (){
        let {batchDeleteNames} = this.state;
        const modal = Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行批量删除本地认证用户 ${batchDeleteNames.length} 在存储池 ${this.state.poolName} 中的配额的操作。`, `You are about to delete these ${batchDeleteNames.length} .`)}</p>
                <p>{lang(`该操作将使这些本地认证用户在存储池 ${this.state.poolName} 中的配额重置为无限制的初始状态，但不会影响这些用户在该存储池中已写入的数据，也不会删除这些用户。`, `This operation will delete the schedule(s) from the system. `)}</p>
                <p>{lang(`建议：在执行该操作前，先确保您选择了正确的本地认证用户和存储池，并且这些用户在该存储池下确实已不需要做配额限制。`, `A suggestion: before executing this operation, ensure that you select the right .`)}</p>
            </div>,
            keyboard: false,
            iconType: 'exclamation-circle-o',
            okType: 'danger',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
                try {
                    // await httpRequests.(batchDeleteNames);
                    await this.setState({batchDeleteUserNames: []});
                    // httpRequests.getSnapshotScheduleList();
                    message.success(lang('批量删除本地认证用户配额成功！', 'Delete  in batch successfully!'));
                } catch ({msg}){
                    message.error(lang('批量删除本地认证用户配额失败，原因：', 'Delete  in batch failed, reason: ') + msg);
                }
                modal.update({cancelButtonProps: {disabled: false}});
            },
            onCancel: () => {

            }
        });
    }

    render (){
        let {poolName} = this.state;
        let {userQuotasOfStoragePool} = this.props;
        let buttonConf = {size: 'small', shape: 'circle', style: {height: 18, width: 18, marginRight: 5}};
		let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
		let tableProps = {
			size: 'normal',
            dataSource: userQuotasOfStoragePool,
            pagination: userQuotasOfStoragePool.length > 12 && {
                pageSize: 12,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items}`
                ),
                size: 'normal',
            },
			rowKey: record => `${record.targetId}-${record.service}`,
			locale: {
				emptyText: lang('暂无用户配额', 'No User Quota')
			},
			rowClassName: () => 'ellipsis',
			columns: [
				{title: lang('用户名', 'Name'), width: 100, dataIndex: 'name',},
				{title: lang('size配额(已使用/配额)', 'Size Limit'), width: 170, dataIndex: 'sizeLimit',
                    render: text => formatStorageSize(text)},
				{title: lang('已使用大小配额', 'Size Used'), width: 170, dataIndex: 'sizeUsed',
                    render: text => formatStorageSize(text)},
                {title: lang('inode配额(已使用/配额)', 'Inode Limit'), width: 170, dataIndex: 'inodeLimit',},
                {title: lang('已使用索引节点配额', 'Inode Used'), width: 170, dataIndex: 'inodeUsed',},
				{title: lang('操作', 'Operations'), width: 170,
					render: (text, record, index) => <div>
						<Popover {...buttonPopoverConf} content={lang('设置', 'Setting')}>
							<Button
								{...buttonConf}
								onClick={this.settingUserQuota.bind(this, record, index)}
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
                        <SetUserQuotaOfStoragePool ref={ref => this.setUserQuotaOfStoragePoolWrapper = ref} />
					</div>
				}
			],
		};
        return (
			<Modal
				width={1200}
				title={lang(`存储池 ${poolName} 的本地认证用户配额信息`,`User Quota of Storage Pool ${poolName}`)}
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
					<div className="fs-table-operation-button-box">
                        <Button
                            type="danger"
                            size="small"
                            disabled={!this.state.batchDeleteNames.length}
                            onClick={this.batchDelete.bind(this)}
                        >
                            {lang('批量删除', 'Delete In Batch')}
                        </Button>
                    </div>
					<div className="fs-main-content-wrapper">
						<Table {...tableProps} />
					</div>
				</div>
			</Modal>
		);
	}
}

const mapStateToProps = state => {
	const {language, main: { storagePool: {userQuotasOfStoragePool}}} = state;
	return {language, userQuotasOfStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(UserQuotaOfStoragePool);