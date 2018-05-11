import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Input, message, Popover, Table} from 'antd';
import CreateCIFS from './CreateCIFS';
import EditCIFS from './EditCIFS';
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class CIFS extends Component {
    constructor (props){
        super(props);
        let {CIFSList} = this.props;
        this.state = {
            // table
            query: '',
            CIFSList,
            CIFSListBackup: CIFSList,
        };
    }

    componentDidMount (){
        httpRequests.getCIFSList();
    }

    async componentWillReceiveProps (nextProps){
        let {CIFSList} = nextProps;
        await this.setState({CIFSList, CIFSListBackup: CIFSList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                CIFSList: [...this.state.CIFSListBackup].filter(({name = ''}) => name.match(query))
            });
        } else {
            this.setState({NFSList: this.state.CIFSListBackup});
        }
    }

    user (){

    }

    create (){
        this.createCIFSrapper.getWrappedInstance().show();
    }

    edit (CIFSShare){
        this.editCIFSWrapper.getWrappedInstance().show(CIFSShare);
    }

    delete (){

    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {NFSList} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: NFSList,
            pagination: 'normal',
            rowKey: 'ip',
            locale: {
                emptyText: lang('暂无NFS共享', 'No NFS Share')
            },
            columns: [
                {title: lang('共享名称', 'Share Name'), width: 200, dataIndex: 'name',},
                {title: lang('共享路径', 'Share Path'), width: 200, dataIndex: 'path',},
                {title: lang('描述', 'Description'), width: 200, dataIndex: 'description',},
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => {
                        return <div>
                            <Popover {...buttonPopoverConf} content={lang('用户', 'User')}>
                                <Button
                                    {...buttonConf}
                                    onClick={this.user.bind(this, record)}
                                    icon="laptop"
                                />
                            </Popover>
                            <Popover {...buttonPopoverConf} content={lang('编辑', 'Edit')}>
                                <Button
                                    {...buttonConf}
                                    onClick={this.edit.bind(this, record, index)}
                                    icon="edit"
                                />
                            </Popover>
                            <Popover {...buttonPopoverConf} content={lang('删除', 'Delete')}>
                                <Button
                                    {...buttonConf}
                                    onClick={this.delete.bind(this, record, index)}
                                    icon="delete"
                                />
                            </Popover>
                        </div>;
                    }
                }
            ],
        };
        return (
            <div className="fs-page-content fs-snapshot-wrapper">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('CIFS共享', 'CIFS Share')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-snapshot-list-wrapper">
                        <div className="fs-snapshot-operation-wrapper">
                            <Input.Search
                                style={{width: 170}}
                                className="fs-search-table-input"
                                size="small"
                                placeholder={lang('共享路径', 'Share Name')}
                                value={this.state.query}
                                enterButton={true}
                                onChange={this.queryChange.bind(this)}
                                onSearch={this.searchInTable.bind(this)}
                            />
                            <Button
                                className="fs-create-snapshot-button" size="small"
                                onClick={this.create.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                        </div>
                        <Table {...tableProps} />
                    </section>
                </section>
                <CreateCIFS ref={ref => this.createCIFSrapper = ref} />
                <EditCIFS ref={ref => this.editCIFSWrapper = ref} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {share: {CIFSList}}} = state;
    return {language, CIFSList};
};

export default connect(mapStateToProps)(CIFS);