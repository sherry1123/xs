import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, Table} from 'antd';
import CreateBuddyGroup from './CreateBuddyGroup';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';

class BuddyGroup extends Component {
    constructor (props){
        super(props);
        let {buddyGroupList} = this.props;
        this.state = {
            // table
            query: '',
            buddyGroupList,
            buddyGroupListBackup: buddyGroupList,
        };
    }

    componentDidMount (){
        httpRequests.getBuddyGroupList();
    }

    async componentWillReceiveProps (nextProps){
        let {buddyGroupList} = nextProps;
        await this.setState({buddyGroupList, buddyGroupListBackup: buddyGroupList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                buddyGroupList: [...this.state.buddyGroupListBackup].filter(({groupId = ''}) => String(groupId).match(query))
            });
        } else {
            this.setState({buddyGroupList: this.state.buddyGroupListBackup});
        }
    }

    create (){
        this.createBuddyGroupWrapper.getWrappedInstance().show();
    }

    render (){
        let {buddyGroupList} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: buddyGroupList,
            pagination: 'normal',
            rowKey: record => `${record.targetId}-${record.service}`,
            locale: {
                emptyText: lang('暂无伙伴组', 'No Buddy Group')
            },
            title: () => (<span className="fs-table-title"><Icon type="desktop" />{lang('伙伴组', 'Buddy Group')}</span>),
            rowClassName: () => 'ellipsis',
            columns: [
                {title: lang('组ID', 'Group ID'), width: 100, dataIndex: 'groupId',},
                {title: lang('服务角色', 'Service Role'), width: 100, dataIndex: 'nodeType',},
                {title: lang('主目标ID', 'Primary Target ID'), width: 100, dataIndex: 'primaryID',},
                {title: lang('主目标路径', 'Primary Target Path'), width: 200, dataIndex: 'primaryPath',},
                {title: lang('从目标ID', 'Secondary Target ID'), width: 100, dataIndex: 'secondaryID',},
                {title: lang('从目标路径', 'Secondary Target Path'), width: 200, dataIndex: 'secondaryPath',},
            ],
        };
        return (
            <div className="fs-page-content">
                <div className="fs-table-operation-wrapper">
                    <Input.Search
                        size="small"
                        placeholder={lang('伙伴组ID', 'Buddy Group ID')}
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
                <CreateBuddyGroup ref={ref => this.createBuddyGroupWrapper = ref} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {target: {buddyGroupList}}} = state;
    return {language, buddyGroupList};
};

export default connect(mapStateToProps)(BuddyGroup);