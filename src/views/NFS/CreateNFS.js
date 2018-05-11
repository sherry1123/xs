import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Form, Icon, Input, Modal, Popover, Table} from "antd";
import CatalogTree from '../../components/CatalogTree/CatalogTree';
import CreateClient from './CreateClient';
import lang from "../../components/Language/lang";

class CreateNFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            showClient: false,
            formValid: false,
            formSubmitting: false,
            shareData: {
                path: '',
                description: '',
                clientList: []
            },
            validation: {
                path: {status: '', help: '', valid: false},
            },
            permissionMap: {
                'read-only': lang('只读', 'Readonly'),
            },
        };
    }

    formValueChange (key, value){
        let shareData = {[key]: value};
        shareData = Object.assign({}, this.state.shareData, shareData);
        this.setState({shareData});
    }

    async validationUpdateState (key, value, valid){
        let {cn, en} = value;
        let validation = {
            [key]: {
                status: (cn || en) ? 'error' : '',
                help: lang(cn, en),
                valid
            }
        };
        validation = Object.assign(this.state.validation, validation);
        await this.setState({validation});
    }

    async validateForm (key){
        let {path} = this.state.shareData;
        if (key === 'path'){
            if (!path){
                this.validationUpdateState('path', {cn: '请选择需要做NFS共享的目录路径', en: 'Please select the share catalog path'}, false);
            } else {
                this.validationUpdateState('path', {cn: '', en: ''}, true);
            }
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    showCatalogTree (){
        this.catalogTreeWrapper.getWrappedInstance().show();
    }

    async selectPath (path){
        console.info(path);
        let shareData = Object.assign(this.state.shareData, {path});
        await this.setState({shareData});
        this.validateForm('path');
    }

    showAddClient (){
        this.createClientWrapper.getWrappedInstance().show([...this.state.shareData.clientList], true);
    }

    addClient (clientList){
        let shareData = Object.assign({}, this.state.shareData);
        shareData.clientList = shareData.clientList.concat(clientList);
        this.setState({shareData});
        this.validateForm('path');
    }

    removeClient (index){
        let shareData = Object.assign({}, this.state.shareData);
        let {clientList} = shareData;
        clientList.splice(index, 1);
        shareData.clientList = clientList;
        this.setState({shareData});
    }

    create (){

    }

    showClient (){
        this.setState({showClient: !this.state.showClient});
    }

    show (){
        this.setState({
            visible: true,
            showClient: false,
            formValid: false,
            formSubmitting: false,
            shareData: {
                path: '',
                description: '',
                clientList: []
            },
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0, placement: 'right'};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 4 : 6},
                sm: {span: isChinese ? 4 : 6},
            },
            wrapperCol: {
                xs: {span: isChinese ? 20 : 18},
                sm: {span: isChinese ? 20 : 18},
            }
        };
        let tableProps = {
            size: 'small',
            dataSource: this.state.shareData.clientList,
            pagination: {
                size: 'normal',
                pageSize: 5,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('该NFS共享暂无客户端，请先添加', 'No client for this NFS share, please create')
            },
            columns: [
                {title: lang('名称', 'Name'), width: 150, dataIndex: 'ip',},
                {title: lang('类型', 'Type'), width: 100, dataIndex: 'type',},
                {title: lang('权限', 'Permission'), width: 100, dataIndex: 'permission',
                    render: text => this.state.permissionMap[text]
                },
                {width: 40,
                    render: (text, record, index) => <Popover {...buttonPopoverConf} content={lang('移除', 'Rmove')}>
                        <Button
                            {...buttonConf}
                            onClick={this.removeClient.bind(this, index)}
                            icon="delete"
                        />
                    </Popover>

                }
            ],
        };
        return (
            <Modal
                title={lang('创建NFS共享', 'Create NFS Share')}
                width={400}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item
                        {...formItemLayout}
                        label={lang('共享路径', 'Share Path')}
                        validateStatus={this.state.validation.path.status}
                        help={this.state.validation.path.help}
                    >
                        <Input
                            style={{width: isChinese ? 280 : 260}} size="small"
                            readOnly
                            placeholder={lang('请选择要共享的目录路径', 'Please select the share catalog path')}
                            value={this.state.shareData.path}
                            addonAfter={
                                <Icon
                                    type="folder-open"
                                    style={{cursor: 'pointer'}}
                                    onClick={this.showCatalogTree.bind(this)}
                                />
                            }
                        />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            style={{width: isChinese ? 280 : 260}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={255}
                            placeholder={lang('描述为选填项，长度0-255位', 'Description is optional, length is 0-255')}
                            value={this.state.shareData.description}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'description')(value);
                            }}
                        />
                    </Form.Item>
                    <div style={{margin: '10px 0 10px 10px'}}>
                        <span
                            style={{fontSize: 12, color: '#1890ff', cursor: 'pointer', userSelect: 'none'}}
                            onClick={this.showClient.bind(this)}
                        >
                            {lang('客户端', 'Client')} <Icon type={this.state.showClient ? 'up' : 'down'} />
                        </span>
                        <Popover
                            {...buttonPopoverConf}
                            content={lang(
                                '此处客户端为非必需项，可在创建该NFS共享成功后再为其添加客户端',
                                'Clients here is not necessary, can create the clients for NFS after itself is created'
                            )}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                        </Popover>
                        {
                            this.state.showClient && <span
                                style={{float: 'right', fontSize: 12, color: '#1890ff', cursor: 'pointer', userSelect: 'none'}}
                                onClick={this.showAddClient.bind(this)}
                            >
                                {lang('添加', 'Add')}
                            </span>
                        }
                    </div>
                    {this.state.showClient && <Table {...tableProps} />}
                </Form>
                <CatalogTree onSelect={this.selectPath.bind(this)} ref={ref => this.catalogTreeWrapper = ref} />
                <CreateClient onAdd={this.addClient.bind(this)} ref={ref => this.createClientWrapper = ref} />
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateNFS);