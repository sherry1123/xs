import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import CreateDataClassification from './CreateDataClassification';
import EditDataClassification from './EditDataClassification';
import {Button, Input, message, Modal, Popover, Table} from 'antd';

class DataClassificationSetting extends Component {
    constructor (props){
        super(props);
        let {dataClassificationList} = this.props;
        this.state = {
            visible: false,
            // table
            query: '',
            dataClassificationList,
            dataClassificationListBackup: dataClassificationList,
        };
    }

    async componentWillReceiveProps (nextProps){
        let {dataClassificationList} = nextProps;
        await this.setState({
			dataClassificationList,
			dataClassificationListBackup: dataClassificationList
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
                dataClassificationList: [...this.state.dataClassificationListBackup].filter(({name = ''}) => String(name).match(query))
            });
        } else {
            this.setState({dataClassificationList: this.state.dataClassificationListBackup});
        }
    }

    show (){
        let {dataClassificationList} = this.props;
		this.setState({
			visible: true,
            query: '',
            dataClassificationList,
            dataClassificationListBackup: dataClassificationList,
		});
		httpRequests.getDataClassificationList();
	}

	hide (){
		this.setState({visible: false,});
	}

    create (){
		this.createDataClassificationWrapper.getWrappedInstance().show();
    }

	edit (dataClassificationData){
		this.editDataClassificationWrapper.getWrappedInstance().show(dataClassificationData);
	}

	delete (dataClassification, index){
		Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行删除数据分级 ${dataClassification.name} 的操作。`, `You are about to delete storage pool ${dataClassification.name}.`)}</p>
				<p>{lang(`该操作将会从系统中移除数据分级 ${dataClassification.name}。如果有存储池已经应用了该分级，将为其自动更换为该分级的上一个分级。`, `This operation will delete data classification ${dataClassification.name} from the system. If there is already a storage pool applies this data classification, will switch it to its higher one automatically fot it.`)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您选择了正确的的数据分级，并确认它已不再需要。`, `A suggestion: before executing this operation, ensure that you select the right data classification and it's no longer necessary.`)}</p>
			</div>,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('删除', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
				try {
					await httpRequests.deleteDataClassification(dataClassification);
					let dataClassificationList = Object.assign([], this.state.dataClassificationList);
					dataClassificationList.splice(index, 1);
					this.setState({dataClassificationList});
					message.success(lang(`数据分级 ${dataClassification.name} 删除成功!`, `Delete data classification ${dataClassification.name} successfully!`));
					httpRequests.getDataClassificationList();
				} catch ({msg}){
					message.error(lang(`删除数据分级 ${dataClassification.name} 失败, 原因: `, `Delete data classification ${dataClassification.name} failed, reason: `) + msg);
				}
			},
			onCancel: () => {

			}
		});
	}

    render (){
        let {dataClassificationList} = this.state;
		let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {height: 18, width: 18, marginRight: 5}};
        let tableProps = {
            size: 'default',
            dataSource: dataClassificationList,
            pagination: dataClassificationList.length > 5 && {
                pageSize: 12,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items}`
                ),
                size: 'normal',
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无数据分级', 'No Data Classification')
            },
            title: () => (
                <div>
					<Input.Search
                        style={{width: 170}}
						size="small"
						placeholder={lang('存储分级名称', 'Data Classification Name')}
						value={this.state.query}
						onChange={this.queryChange.bind(this)}
						onSearch={this.searchInTable.bind(this)}
					/>
                    <Button
						style={{float: 'right'}}
						type="primary"
						size="small"
						onClick={this.create.bind(this)}
					>
						{lang('创建', 'Create')}
					</Button>
                </div>
            ),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('名称', 'Name'), width: 150, dataIndex: 'name',},
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
            <Modal
				width={600}
				title={lang(`数据分级信息`,`Data Classification Information`)}
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
                    <CreateDataClassification ref={ref => this.createDataClassificationWrapper = ref} />
				    <EditDataClassification ref={ref => this.editDataClassificationWrapper = ref} />
				</div>
			</Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {storagePool: {dataClassificationList}}} = state;
    return {language, dataClassificationList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(DataClassificationSetting);