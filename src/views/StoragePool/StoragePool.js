import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, Icon, Input, Table} from 'antd';
import httpRequests from "../../http/requests";

class StoragePool extends Component {
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
        await this.setState({storagePoolList, storagePoolListBackup: storagePoolList});
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

    }

    render (){
        let {storagePoolList} = this.state;
        // let buttonConf = {size: 'small', shape: 'circle', style: {height: 18, width: 18, marginRight: 5}};
        let tableProps = {
            size: 'normal',
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
            title: () => (<span className="fs-table-title"><Icon type="camera-o" />{lang('存储池', 'Storage Pool')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('名称', 'Name'), width: 150, dataIndex: 'name',},
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
                    </div>
                </div>
                <div className="fs-main-content-wrapper">
                    <Table {...tableProps} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {storagePool: {storagePoolList}}} = state;
    return {language, storagePoolList};
};

export default connect(mapStateToProps)(StoragePool);