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

    delete ({type, path}){
        Modal.confirm({
            title: lang(`确定删除这个NAS导出: ${type}@${path} ?`, `Are you sure you want to delete this NAS export: ${type}@${path} ?`),
            content: lang('此操作不可恢复', 'You can\'t undo this action'),
            okText: lang('删除', 'Delete'),
            cancelText: lang('取消', 'Cancel'),
            onOk: () => {

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
        if (key === 'path'){
            // *** should confirm whether one path with a same protocol can be exported more than one time
            if (!this.state.nasExportData.path){
                await this.validationUpdateState('name', {
                    cn: '请输入要做导出的路径',
                    en: 'Please enter export path'
                }, false);
            }
        }
        if (key === 'protocol'){
            if (!this.state.nasExportData.protocol){
                await this.validationUpdateState('name', {
                    cn: '请选择一个NAS导出协议',
                    en: 'Please select a NAS export protocol'
                }, false);
            }
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
            message.success(lang('NAS导出成功!', 'NAS export successfully!'));
            this.setState({formSubmitting: false});
        } catch ({msg}){
            message.success(lang('NAS导出失败, 原因: ', 'NAS export failed, reason: ') + msg);
            this.setState({formSubmitting: false});
        }
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let tableProps = {
            dataSource: this.state.nasExportList,
            pagination: true,
            rowKey: record => record.type + '@' + record.path,
            locale: {
                emptyText: lang('暂无NAS导出', 'No NAS Export')
            },
            columns: [
                {title: lang('协议类型', 'Protocol'), width: 125, dataIndex: 'protocol',},
                {title: lang('导出路径', 'Export Path'), width: 120, dataIndex: 'path',},
                {title: lang('操作', 'Operation'), width: 80,
                    render: (text, record) => (
                        <div>
                            <a title={lang('删除', 'Delete')}
                               onClick={this.delete.bind(this, record)}
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
                        <Input.Search style={{marginRight: 15, width: 150}} size="small"
                              placeholder={lang('导出路径', 'export path')}
                              value={this.state.query}
                              onChange={this.queryChange.bind(this)}
                              onSearch={this.searchInTable.bind(this)}
                        />
                        <Button className="fs-create-snapshot-button"
                            size="small"
                            onClick={() => {this.setState({visible: true});}}
                        >
                            {lang('创建NAS导出', 'Create NAS Export')}
                        </Button>
                        <Table {...tableProps} />
                    </section>
                </section>
                <Modal title={lang('创建NAS导出', 'Create NAS Export')}
                       width={250}
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
                            <Select style={{width: 150}} size="small"
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
                            <Input style={{width: 150}} size="small"
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