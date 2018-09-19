import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Popover, Table} from 'antd';
import DirectoryTree from 'Components/DirectoryTree/DirectoryTree';
import CreateClientToNFS from './CreateClientToNFS';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class CreateNFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            formStep: 1,
            shareData: {
                path: '',
                description: '',
                clientList: []
            },
            validation: {
                path: {status: '', help: '', valid: false},
            },
        };
    }

    nextStep (){
        this.setState({formStep: 2});
    }

    prevStep (){
        this.setState({formStep: 1});
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
        validation = Object.assign({}, this.state.validation, validation);
        await this.setState({validation});
    }

    async validateForm (key){
        await this.validationUpdateState(key, {cn: '', en: ''}, true);
        let {path} = this.state.shareData;
        if (key === 'path'){
            if (!path){
                this.validationUpdateState('path', {cn: '请选择需要做NFS共享的目录路径', en: 'Please select the NFS share catalog path'}, false);
            }
            let isPathDuplicated = this.props.NFSList.some(NFS => NFS.path === path);
            if (isPathDuplicated){
                this.validationUpdateState('path', {cn: '已有NFS共享使用此路径，请重新选择', en: 'This path has been used by another NFS share, please change it'}, false);
            }
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    showDirectoryTree (){
        this.directoryTreeWrapper.getWrappedInstance().show(this.state.shareData.path ? [this.state.shareData.path] : [], 'share');
    }

    async selectPath (path){
        let shareData = Object.assign(this.state.shareData, {path});
        await this.setState({shareData});
        this.validateForm('path');
    }

    showAddClient (){
        this.createClientToNFSWrapper.getWrappedInstance().show({
            clientListOfNFS: [...this.state.shareData.clientList],
            path: this.state.shareData.path,
            notDirectlyCreate: true
        });
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

    async create (){
        let shareData = Object.assign({}, this.state.shareData);
        this.setState({formSubmitting: true});
        try {
            // remove key 'ips' which is not necessary
            shareData.clientList.forEach(client => delete client.ips);
            await httpRequests.createNFSShare(shareData);
            httpRequests.getNFSShareList();
            await this.hide();
            message.success(lang(`创建NFS共享 ${shareData.path} 成功!`, `Create NFS share ${shareData.path} successfully!`));
        } catch ({msg}){
            message.error(lang(`创建NFS共 ${shareData.path} 失败, 原因: `, `Create NFS share ${shareData.path} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (){
        this.setState({
            visible: true,
            formValid: false,
            formSubmitting: false,
            formStep: 1,
            shareData: {
                path: '',
                description: '',
                clientList: []
            },
            validation: {
                path: {status: '', help: '', valid: false},
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
        let permissionMap = {
            'full-control': lang('完全控制', 'Full control'),
            'read_and_write': lang('读写', 'Read and write'),
            'readonly': lang('只读', 'Readonly'),
            'forbidden': lang('禁止', 'Forbidden'),
        };
        let tableProps = {
            size: 'small',
            dataSource: this.state.shareData.clientList,
            pagination: {
                size: 'normal',
                pageSize: 5,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: 'ip',
            locale: {
                emptyText: lang('暂未选择客户端', 'No selected client')
            },
            columns: [
                {title: lang('名称', 'Name'), width: 150, dataIndex: 'ip',},
                {title: lang('类型', 'Type'), width: 60, dataIndex: 'type',},
                {title: lang('权限', 'Permission'), width: 90, dataIndex: 'permission',
                    render: text => permissionMap[text]
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
                title={lang(`创建NFS共享 ${this.state.formStep === 1 ? '- 步骤1: 设置基础配置' : '- 步骤2: 添加客户端'}`, `Create NFS Share ${this.state.formStep === 1 ? '- Step 1: Set Basic Configuration' : '- Add Client'}`)}
                width={400}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        {
                            this.state.formStep === 1 ? <Button
                                size="small"
                                type="primary"
                                disabled={!this.state.formValid}
                                onClick={this.nextStep.bind(this)}
                            >
                                {lang('下一步', 'Next')}
                            </Button> :
                            <Button
                                size="small"
                                type="primary"
                                disabled={!this.state.formValid}
                                loading={this.state.formSubmitting}
                                onClick={this.create.bind(this)}
                            >
                                {lang('创建', 'Create')}
                            </Button>
                        }
                        {
                            this.state.formStep === 2 && <Button
                                style={{float: 'left'}}
                                size="small"
                                onClick={this.prevStep.bind(this)}
                            >
                                {lang('上一步', 'Previous')}
                            </Button>
                        }
                    </div>
                }
            >
                <Form>
                    {
                        this.state.formStep === 1 && <div>
                            <Form.Item
                                {...formItemLayout}
                                label={lang('共享路径', 'Share Path')}
                                validateStatus={this.state.validation.path.status}
                                help={this.state.validation.path.help}
                            >
                                <Input
                                    style={{width: isChinese ? 280 : 260}} size="small"
                                    readOnly
                                    placeholder={lang('请选择要共享的目录路径', 'Please select share directory path')}
                                    value={this.state.shareData.path}
                                    addonAfter={
                                        <Icon
                                            type="folder-open"
                                            style={{cursor: 'pointer'}}
                                            onClick={this.showDirectoryTree.bind(this)}
                                        />
                                    }
                                />
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                                <Input.TextArea
                                    style={{width: isChinese ? 280 : 260}} size="small"
                                    autosize={{minRows: 4, maxRows: 6}}
                                    maxLength={200}
                                    placeholder={lang('描述为选填项，长度0-200位', 'Description is optional, length is 0-200')}
                                    value={this.state.shareData.description}
                                    onChange={({target: {value}}) => {
                                        this.formValueChange.bind(this, 'description')(value);
                                    }}
                                />
                            </Form.Item>
                        </div>
                    }
                    {
                        this.state.formStep === 2 && <div>
                            {lang('客户端', 'Client')}
                            <Popover
                                {...buttonPopoverConf}
                                content={lang(
                                    '此处客户端为非必需项，可在创建该NFS共享成功后再为其添加',
                                    'Clients here is not necessary, can create the items for NFS after itself is created'
                                )}
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                            </Popover>
                            <span
                                style={{float: 'right', fontSize: 12, color: '#1890ff', cursor: 'pointer', userSelect: 'none'}}
                                onClick={this.showAddClient.bind(this)}
                            >
                                {lang('添加', 'Add')}
                            </span>
                            <Table style={{marginTop: 15}} {...tableProps} />
                        </div>
                    }
                </Form>
                <DirectoryTree onSelect={this.selectPath.bind(this)} ref={ref => this.directoryTreeWrapper = ref} />
                <CreateClientToNFS onAdd={this.addClient.bind(this)} ref={ref => this.createClientToNFSWrapper = ref} />
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {share: {NFSList}}} = state;
    return {language, NFSList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateNFS);