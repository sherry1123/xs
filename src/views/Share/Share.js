import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Select, Table} from 'antd';
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
            // form
            visible: false,
            formValid: false,
            formSubmitting: false,
            shareData: {
                path: '',
                protocol: ''
            },
            validation: {
                path: {status: '', help: '', valid: false},
                protocol: {status: '', help: '', valid: false}
            }
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
            title: lang(`确定删除这个共享: ${protocol}@${path} ?`, `Are you sure you want to delete this share: ${protocol}@${path} ?`),
            content: lang('此操作不可恢复', 'You can\'t undo this action'),
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

    formValueChange (key, value){
        let shareData = Object.assign({}, this.state.shareData, {[key]: value});
        this.setState({shareData});
    }

    async validateForm (key){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: '', help: '', valid: true}});
        await this.setState({validation});
        let {path, protocol} = this.state.shareData;
        if (key === 'path'){
            if (!path){
                await this.validationUpdateState('path', {
                    cn: '请输入要做共享的路径',
                    en: 'Please enter share path'
                }, false);
            }
        }
        if (key === 'protocol'){
            if (!protocol){
                await this.validationUpdateState('protocol', {
                    cn: '请选择一个协议',
                    en: 'Please select a protocol'
                }, false);
            }
        }
        // one path with one protocol group can only be exported once
        let share = `${path}@${protocol}`;
        let isShareDuplicated = this.props.shareList.some(({path, protocol}) => share === `${path}@${protocol}`);
        if (isShareDuplicated){
            await this.validationUpdateState('name', {
                cn: '同一路径和同一协议的组合只能做一次共享',
                en: 'One path with one protocol group can only be shared once'
            }, false);
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async validationUpdateState (key, value, valid){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: (value.cn || value.en) ? 'error' : '', help: lang(value.cn, value.en), valid: valid}});
        await this.setState({validation});
    }

    async createShare (){
        let shareData = Object.assign({}, this.state.shareData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createShare(shareData);
            httpRequests.getShareList();
            await this.hide();
            message.success(lang('创建共享成功!', 'Create share successfully!'));
            this.setState({formSubmitting: false});
        } catch ({msg}){
            message.success(lang('创建共享失败, 原因: ', 'Create share failed, reason: ') + msg);
            this.setState({formSubmitting: false});
        }
    }

    show (){
        this.setState({
            visible: true,
            formSubmitting: false,
            shareData: {
                path: '',
                protocol: ''
            },
            validation: {
                path: {status: '', help: '', valid: false},
                protocol: {status: '', help: '', valid: false}
            }
        });
    }

    hide (){
        this.setState({visible: false});
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
                            <a title={lang('删除', 'Delete')}
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
                            <Input.Search style={{marginRight: 15, width: 150}} size="small"
                                placeholder={lang('共享路径', 'share path')}
                                value={this.state.query}
                                enterButton={true}
                                onChange={this.queryChange.bind(this)}
                                onSearch={this.searchInTable.bind(this)}
                            />
                            <Button className="fs-create-snapshot-button"
                                size="small"
                                onClick={this.show.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                        </div>
                        <Table {...tableProps} />
                    </section>
                </section>
                <Modal title={lang('创建共享', 'Create Share')}
                       width={320}
                       closable={false}
                       maskClosable={false}
                       visible={this.state.visible}
                       footer={
                           <div>
                               <Button type="primary" disabled={!this.state.formValid} loading={this.state.formSubmitting}
                                    size='small' onClick={this.createShare.bind(this)}
                               >
                                   {lang('创建', 'Create')}
                               </Button>
                               <Button size='small' onClick={this.hide.bind(this)}>
                                   {lang('取消', 'Cancel')}
                               </Button>
                           </div>
                       }
                >
                    <Form>
                        <Form.Item label={lang('共享路径', 'Share Path')}
                           validateStatus={this.state.validation.path.status}
                           help={this.state.validation.path.help}
                        >
                            <Input style={{width: 240}} size="small"
                               placeholder={lang('请输入共享路径', 'please enter share path')}
                               value={this.state.shareData.path}
                               onChange={({target: {value}}) => {
                                   this.formValueChange.bind(this, 'path')(value);
                                   this.validateForm.bind(this)('path');
                               }}
                            />
                        </Form.Item>
                        <Form.Item label={lang('协议', 'Protocol')}
                            validateStatus={this.state.validation.protocol.status}
                            help={this.state.validation.protocol.help}
                        >
                            <Select style={{width: 240}} size="small"
                                placeholder={lang('请选择协议', 'please select protocol')}
                                value={this.state.shareData.protocol}
                                onChange={value => {
                                    this.formValueChange.bind(this, 'protocol', value)();
                                    this.validateForm.bind(this)('protocol');
                                }}
                            >
                                <Select.Option value="nfs">NFS (Linux/UNIX/Mac)</Select.Option>
                                <Select.Option value="cifs">CIFS (Windows/Mac)</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {share: {shareList}}} = state;
    return {language, shareList};
};

export default connect(mapStateToProps)(Share);