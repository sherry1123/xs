import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, message, Modal, Table} from 'antd';
import CreateShare from './CreateShare';
import EditShare from './EditShare';
import lang from "../../components/Language/lang";
import httpRequests from '../../http/requests';

class Share extends Component {
    constructor (props){
        super(props);
        let {shareList} = this.props;
        this.state = {
            // table
            query: '',
            shareList,
            shareListBackup: shareList,
            readDeleteWarning: false
        };
    }

    componentDidMount (){
        httpRequests.getShareList();
    }

    async componentWillReceiveProps (nextProps){
        let {shareList} = nextProps;
        await this.setState({shareList, shareListBackup: shareList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                shareList: Object.assign([], this.state.shareListBackup).filter(({path}) => path.match(query))
            });
        } else {
            this.setState({shareList: this.state.shareListBackup});
        }
    }

    delete ({protocol, path}, index){
        Modal.confirm({
            title: lang('警告', 'Warning'),
            content: <div style={{fontSize: 12}}>
                <p>{lang(`您将要执行删除共享 ${protocol}@${path} 的操作。`, `You are about to delete share ${protocol}@${path}`)}</p>
                <p>{lang(`该操作将导致共享不可用，并且断开正在访问该共享目录的用户的连接。`, `This operation will make the share unavailable and interrupt the connections of the users to this directory.`)}</p>
                <p>{lang(`建议：在执行该操作前先确保无任何业务运行在该共享上。`, `A suggestion: before deleting this share, ensure that there's no service is running on this share.`)}</p>
            </div>,
            iconType: 'exclamation-circle-o',
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteShare({protocol, path});
                    let shareList = Object.assign([], this.state.shareList);
                    shareList.splice(index, 1);
                    this.setState({shareList});
                    message.success(lang(`共享 ${protocol}@${path} 删除成功!`, `Delete share ${protocol}@${path} successfully!`));
                } catch ({msg}){
                    message.error(lang(`共享 ${protocol}@${path} 删除失败, 原因: `, `Delete share ${protocol}@${path} failed, reason: `) + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    create (){
        this.createShareWrapper.getWrappedInstance().show();
    }

    edit (shareData){
        this.editShareWrapper.getWrappedInstance().show(shareData);
    }

    render (){
        let tableProps = {
            dataSource: this.state.shareList,
            pagination: true,
            rowKey: record => record._id,
            locale: {
                emptyText: lang('暂无共享', 'No Share')
            },
            columns: [
                {title: lang('共享路径', 'Share Path'), width: 120, dataIndex: 'path',},
                {title: lang('协议类型', 'Protocol'), width: 125, dataIndex: 'protocol',},
                {title: lang('描述', 'Description'), width: 120, dataIndex: 'description',
                    render: text => text || '--'
                },
                {title: lang('操作', 'Operation'), width: 80,
                    render: (text, record, index) => (
                        <div>
                            <a
                                title={lang('编辑', 'Edit')}
                                onClick={this.edit.bind(this, record)}
                            >
                                <Icon style={{fontSize: 15}} type="edit" />
                            </a>
                            <a
                                title={lang('删除', 'Delete')}
                                onClick={this.delete.bind(this, record, index)}
                                style={{marginLeft: 10}}
                            >
                                <Icon style={{fontSize: 15}} type="delete" />
                            </a>
                        </div>
                    )
                }
            ],
        };
        return (
            <div className="fs-page-content fs-snapshot-wrapper">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('共享', 'Share')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-snapshot-list-wrapper">
                        <div className="fs-snapshot-operation-wrapper">
                            <Input.Search
                                style={{width: 170}}
                                size="small"
                                placeholder={lang('共享路径', 'share path')}
                                value={this.state.query}
                                enterButton={true}
                                onChange={this.queryChange.bind(this)}
                                onSearch={this.searchInTable.bind(this)}
                            />
                            <Button className="fs-create-snapshot-button"
                                size="small"
                                onClick={this.create.bind(this, true)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                        </div>
                        <Table {...tableProps} />
                    </section>
                </section>
                <CreateShare ref={ref => this.createShareWrapper = ref} />
                <EditShare ref={ref => this.editShareWrapper = ref} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {share: {shareList}}} = state;
    return {language, shareList};
};

export default connect(mapStateToProps)(Share);