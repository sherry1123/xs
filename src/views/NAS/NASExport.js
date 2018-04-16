import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Select, Table} from 'antd';
import lang from "../../components/Language/lang";
import httpRequests from '../../http/requests';

class NASExport extends Component {
    constructor (props){
        super(props);
        let {nasExportList} = this.props;
        this.state = {
            // table
            query: '',
            nasExportList,
            nasExportListBackup: nasExportList,
            // form
            visible: false,
            formValid: false,
            formSubmitting: false,
            nasExportData: {
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
        httpRequests.getNasExportList();
    }

    async componentWillReceiveProps (nextProps){
        let {nasExportList} = nextProps;
        await this.setState({nasExportList, nasExportListBackup: nasExportList});
        await this.searchInTable(this.state.query, true);
    }

    queryChange ({target: {value: query}}){
        this.setState({query});
    }

    async searchInTable (query, dataRefresh){
        if (query || dataRefresh){
            await this.setState({
                query,
                nasExportList: Object.assign([], this.state.nasExportListBackup).filter(({path}) => path.match(query))
            });
        } else {
            this.setState({nasExportList: this.state.nasExportListBackup});
        }
    }

    delete ({protocol, path}, index){
        Modal.confirm({
            title: lang(`确定删除这个NAS导出: ${protocol}@${path} ?`, `Are you sure you want to delete this NAS export: ${protocol}@${path} ?`),
            content: lang('此操作不可恢复', 'You can\'t undo this action'),
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: async () => {
                try {
                    await httpRequests.deleteNasExport({protocol, path});
                    let nasExportList = Object.assign([], this.state.nasExportList);
                    nasExportList.splice(index, 1);
                    this.setState({nasExportList});
                    message.success(lang(`NAS导出 ${protocol}@${path} 删除成功!`, `Delete NAS export ${protocol}@${path} successfully!`));
                } catch ({msg}){
                    message.error(lang(`NAS导出 ${protocol}@${path} 删除失败, 原因: `, `Delete NAS export ${protocol}@${path} failed, reason: `) + msg);
                }
            },
            onCancel: () => {

            }
        });
    }

    formValueChange (key, value){
        let nasExportData = Object.assign({}, this.state.nasExportData, {[key]: value});
        this.setState({nasExportData});
    }

    async validateForm (key){
        let validation = Object.assign({}, this.state.validation, {[key]: {status: '', help: '', valid: true}});
        await this.setState({validation});
        let {path, protocol} = this.state.nasExportData;
        if (key === 'path'){
            if (!path){
                await this.validationUpdateState('path', {
                    cn: '请输入要做导出的路径',
                    en: 'Please enter export path'
                }, false);
            }
        }
        if (key === 'protocol'){
            if (!protocol){
                await this.validationUpdateState('protocol', {
                    cn: '请选择一个NAS导出协议',
                    en: 'Please select a NAS export protocol'
                }, false);
            }
        }
        // one path with one protocol group can only be exported once
        let nasExport = `${path}@${protocol}`;
        let isNasExportDuplicated = this.prop.nasExportList.some(({path, protocol}) => nasExport === `${path}@${protocol}`);
        if (isNasExportDuplicated){
            await this.validationUpdateState('name', {
                cn: '同一路径和同一协议的组合只能被导出一次',
                en: 'One path with one protocol group can only be exported once'
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

    async createNasExport (){
        let nasExportData = Object.assign({}, this.state.nasExportData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createNasExport(nasExportData);
            httpRequests.getNasExportList();
            await this.hide();
            message.success(lang('创建NAS导出成功!', 'Create NAS export successfully!'));
            this.setState({formSubmitting: false});
        } catch ({msg}){
            message.success(lang('创建NAS导出失败, 原因: ', 'Create NAS export failed, reason: ') + msg);
            this.setState({formSubmitting: false});
        }
    }

    show (){
        this.setState({
            visible: true,
            formSubmitting: false,
            nasExportData: {
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
            dataSource: this.state.nasExportList,
            pagination: true,
            rowKey: record => record._id,
            locale: {
                emptyText: lang('暂无NAS导出', 'No NAS Export')
            },
            columns: [
                {title: lang('协议类型', 'Protocol'), width: 125, dataIndex: 'protocol',},
                {title: lang('导出路径', 'Export Path'), width: 120, dataIndex: 'path',},
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
                    <h3 className="fs-page-title">{lang('NAS导出', 'NAS Export')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-snapshot-list-wrapper">
                        <div className="fs-snapshot-operation-wrapper">
                            <Input.Search style={{marginRight: 15, width: 150}} size="small"
                                placeholder={lang('导出路径', 'export path')}
                                value={this.state.query}
                                enterButton={true}
                                onChange={this.queryChange.bind(this)}
                                onSearch={this.searchInTable.bind(this)}
                            />
                            <Button className="fs-create-snapshot-button"
                                size="small"
                                onClick={this.show.bind(this)}
                            >
                                {lang('创建NAS导出', 'Create NAS Export')}
                            </Button>
                        </div>
                        <Table {...tableProps} />
                    </section>
                </section>
                <Modal title={lang('创建NAS导出', 'Create NAS Export')}
                       width={320}
                       closable={false}
                       maskClosable={false}
                       visible={this.state.visible}
                       footer={
                           <div>
                               <Button type="primary" disabled={!this.state.formValid} loading={this.state.formSubmitting}
                                    size='small' onClick={this.createNasExport.bind(this)}
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
                        <Form.Item label={lang('导出协议', 'Export Protocol')}
                            validateStatus={this.state.validation.protocol.status}
                            help={this.state.validation.protocol.help}
                        >
                            <Select style={{width: 100}} size="small"
                                placeholder={lang('请选择导出协议', 'select export protocol')}
                                value={this.state.nasExportData.protocol}
                                onChange={value => {
                                    this.formValueChange.bind(this, 'protocol', value)();
                                    this.validateForm.bind(this)('protocol');
                                }}
                            >
                                <Select.Option value="nfs">NFS</Select.Option>
                                <Select.Option value="cifs">CIFS</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label={lang('导出路径', 'Export Path')}
                            validateStatus={this.state.validation.path.status}
                            help={this.state.validation.path.help}
                        >
                            <Input style={{width: 240}} size="small"
                                   placeholder={lang('请输入导出路径', 'please enter export path')}
                                   value={this.state.nasExportData.path}
                                   onChange={({target: {value}}) => {
                                       this.formValueChange.bind(this, 'path')(value);
                                       this.validateForm.bind(this)('path');
                                   }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {nas: {nasExportList}}} = state;
    return {language, nasExportList};
};

export default connect(mapStateToProps)(NASExport);