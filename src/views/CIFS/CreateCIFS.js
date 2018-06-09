import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Popover, Select, Switch, Table} from 'antd';
import CatalogTree from '../../components/CatalogTree/CatalogTree';
import AddLocalAuthUserToCIFS from './AddLocalAuthUserToCIFS';
import AddLocalAuthUserGroupToCIFS from './AddLocalAuthUserGroupToCIFS';
import lang from '../../components/Language/lang';
import {validateFsName} from '../../services';
import httpRequests from '../../http/requests';

class CreateCIFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formStep: 1,
            formValid: false,
            formSubmitting: false,
            shareData: {
                path: '',
                name: '',
                description: '',
                oplock: true,
                notify: true,
                offlineCacheMode: 'manual',
                userOrGroupList: []
            },
            validation: {
                path: {status: '', help: '', valid: false},
                name: {status: '', help: '', valid: false},
            },
            typeMap: {
                'local_user': lang('本地认证用户', 'Local Authentication User'),
                'local_group': lang('本地认证用户组', 'Local Authentication User Group'),
            },
            permissionMap: {
                'full-control': lang('完全控制', 'Full control'),
                'read_and_write': lang('读写', 'Read and write'),
                'readonly': lang('只读', 'Readonly'),
                'forbidden': lang('禁止', 'Forbidden'),
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
        validation = Object.assign(this.state.validation, validation);
        await this.setState({validation});
    }

    async validateForm (key){
        await this.validationUpdateState(key, {cn: '', en: ''}, true);
        let {path, name} = this.state.shareData;
        if (key === 'path'){
            if (!path){
                this.validationUpdateState('path', {cn: '请选择需要做CIFS共享的目录路径', en: 'Please select the CIFS share catalog path'}, false);
            }
            // one path can be shared by different CIFSs
            /*
            let isPathDuplicated = this.props.CIFSList.some(CIFS => CIFS.path === path);
            if (isPathDuplicated){
                this.validationUpdateState('path', {cn: '已有CIFS共享使用此路径，请重新选择', en: 'This path has been used by another CIFS share, please change it'}, false);
            }
            */
        }
        if (key === 'name'){
            if (!validateFsName(name)){
                await this.validationUpdateState('name', {
                    cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位或末尾位）的组合，长度3-30位',
                    en: 'Name can only contains letter, number and underscore(except for the first), length is 3-30.'
                }, false);
            }
            let isNameDuplicated = this.props.CIFSList.some(CIFS => CIFS.name === name);
            if (isNameDuplicated){
                this.validationUpdateState('name', {cn: '已有CIFS共享使用此名称，请重新输入', en: 'This name has been used by another CIFS share, please change it'}, false);
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
        let shareData = Object.assign(this.state.shareData, {path});
        await this.setState({shareData});
        this.validateForm('path');
    }

    showAddUser (){
        let {userOrGroupList} = this.state.shareData;
        let localAuthUserListOfCIFS = userOrGroupList.filter(item => item.type === 'local_user');
        this.addLocalAuthUserToCIFSWrapper.getWrappedInstance().show({
            localAuthUserListOfCIFS,
            share: this.state.shareData,
            notDirectlyCreate: true
        });
    }

    showAddGroup (){
        let {userOrGroupList} = this.state.shareData;
        let localAuthUserGroupListOfCIFS = userOrGroupList.filter(item => item.type === 'local_group');
        this.addLocalAuthUserGroupToCIFSWrapper.getWrappedInstance().show({
            localAuthUserGroupListOfCIFS,
            share: this.state.shareData,
            notDirectlyCreate: true
        });
    }

    addUserOrGroup (userOrGroupList){
        let shareData = Object.assign({}, this.state.shareData);
        shareData.userOrGroupList = shareData.userOrGroupList.concat(userOrGroupList);
        this.setState({shareData});
    }

    removeUserOrGroup (index){
        let shareData = Object.assign({}, this.state.shareData);
        let {userOrGroupList} = shareData;
        userOrGroupList.splice(index, 1);
        shareData.userOrGroupList = userOrGroupList;
        this.setState({shareData});
    }

    async create (){
        let shareData = Object.assign({}, this.state.shareData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createCIFSShare(shareData);
            httpRequests.getCIFSShareList();
            await this.hide();
            message.success(lang(`创建CIFS共享 ${shareData.path}成功!`, `Create CIFS share ${shareData.path} successfully!`));
        } catch ({msg}){
            message.error(lang(`创建CIFS共 ${shareData.path} 失败, 原因: `, `Create CIFS share ${shareData.path} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (){
        this.setState({
            visible: true,
            formStep: 1,
            formValid: false,
            formSubmitting: false,
            shareData: {
                path: '',
                name: '',
                description: '',
                oplock: true,
                notify: true,
                offlineCacheMode: 'manual',
                userOrGroupList: []
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
                xs: {span: isChinese ? 6 : 8},
                sm: {span: isChinese ? 6 : 8},
            },
            wrapperCol: {
                xs: {span: isChinese ? 18 : 16},
                sm: {span: isChinese ? 18 : 16},
            }
        };
        let tableProps = {
            size: 'small',
            dataSource: this.state.shareData.userOrGroupList,
            pagination: {
                size: 'normal',
                pageSize: 5,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: 'name',
            locale: {
                emptyText: lang('暂未选择用户/用户组', 'No selected user/user group')
            },
            columns: [
                {title: lang('名称', 'Name'), width: 100, dataIndex: 'name',},
                {title: lang('类型', 'Type'), width: 180, dataIndex: 'type',
                    render: text => this.state.typeMap[text]
                },
                {title: lang('权限', 'Permission'), width: 90, dataIndex: 'permission',
                    render: text => this.state.permissionMap[text]
                },
                {width: 40,
                    render: (text, record, index) => <Popover {...buttonPopoverConf} content={lang('移除', 'Rmove')}>
                        <Button
                            {...buttonConf}
                            onClick={this.removeUserOrGroup.bind(this, index)}
                            icon="delete"
                        />
                    </Popover>

                }
            ],
        };
        return (
            <Modal
                title={lang('创建CIFS共享', 'Create CIFS Share')}
                width={450}
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
                                    style={{width: isChinese ? 290 : 250}}
                                    size="small"
                                    readOnly
                                    placeholder={lang('请选择要共享的目录路径', 'Please select share directory path')}
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
                            <Form.Item
                                {...formItemLayout}
                                label={lang('共享名称', 'Share Name')}
                                validateStatus={this.state.validation.name.status}
                                help={this.state.validation.name.help}
                            >
                                <Input
                                    style={{width: isChinese ? 290 : 250}}
                                    size="small"
                                    placeholder={lang('请输入共享名称', 'Please enter share name')}
                                    value={this.state.shareData.name}
                                    onChange={({target: {value}}) => {
                                        this.formValueChange.bind(this, 'name')(value);
                                        this.validateForm.bind(this, 'name')(value);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                                <Input.TextArea
                                    style={{width: isChinese ? 290 : 250}}
                                    size="small"
                                    autosize={{minRows: 4, maxRows: 6}}
                                    maxLength={200}
                                    placeholder={lang('描述为选填项，长度0-200位', 'Description is optional, length is 0-200')}
                                    value={this.state.shareData.description}
                                    onChange={({target: {value}}) => {
                                        this.formValueChange.bind(this, 'description')(value);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Oplock">
                                <Switch
                                    style={{marginRight: 10}}
                                    size="small"
                                    checked={this.state.shareData.oplock}
                                    onChange={value => {
                                        this.formValueChange.bind(this, 'oplock')(value);
                                    }}
                                />
                                {this.state.shareData.oplock ? lang('启用', 'Enable') : lang('不启用', 'Enable')}
                                <Popover
                                    {...buttonPopoverConf}
                                    content={lang(
                                        'Oplock(Opportunistic locking)是提升客户端访问效率的一种机制，用户文件在发送到共享存储之前进行本地缓冲',
                                        'Oplock(Opportunistic locking) is a mechanism that improves client access efficiency. After this mechanism is enabled, files are cached locally before being sent to shared storage.'
                                    )}
                                >
                                    <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                                </Popover>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Notify">
                                <Switch
                                    style={{marginRight: 10}}
                                    size="small"
                                    checked={this.state.shareData.notify}
                                    onChange={value => {
                                        this.formValueChange.bind(this, 'notify')(value);
                                    }}
                                />
                                {this.state.shareData.notify ? lang('启用', 'Enable') : lang('不启用', 'Enable')}
                                <Popover
                                    {...buttonPopoverConf}
                                    content={lang(
                                        '勾选本项后，一个客户端针对一个目录内的变更操作（如新增目录、新增文件、修改目录、修改文件等），可被其他正在访问此目录及其父目录的客户端感知，如自动刷新显示',
                                        'After this option is selected, if a client modifies a directory (such as adding directories, adding files, modifying directories, or modifying files), other clients that are accessing the directory or the parent directory of the directory can detect the modification. The modification is displayed after automatic refresh.'
                                    )}
                                >
                                    <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                                </Popover>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={lang('离线缓存模式', 'Offline Cache Mode')}>
                                <Select
                                    style={{width: isChinese ? 290 : 250}}
                                    size="small"
                                    value={this.state.shareData.offlineCacheMode}
                                    onChange={value => {
                                        this.formValueChange.bind(this, 'offlineCacheMode')(value);
                                    }}
                                >
                                    <Select.Option value="manual">{lang('手动', 'Manual')}</Select.Option>
                                    <Select.Option value="documents">{lang('文档', 'Documents')}</Select.Option>
                                    <Select.Option value="programs">{lang('程序', 'Programs')}</Select.Option>
                                    <Select.Option value="none">{lang('关闭', 'None')}</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                    }
                    {
                        this.state.formStep === 2 && <div>
                            {lang('用户/用户组', 'User/User Group')}
                            <Popover
                                {...buttonPopoverConf}
                                content={lang(
                                    `此处用户/用户组为非必需项，可在创建该CIFS共享成功后再为其添加`,
                                    `User/user group here is not necessary, can create the items for CIFS after itself is created`
                                )}
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                            </Popover>
                            <span
                                style={{float: 'right', fontSize: 12, color: '#1890ff', cursor: 'pointer', userSelect: 'none'}}
                                onClick={this.showAddGroup.bind(this)}
                            >
                                {lang('添加用户组', 'Add User Group')}
                            </span>
                            <span
                                style={{float: 'right', marginRight: 10, fontSize: 12, color: '#1890ff', cursor: 'pointer', userSelect: 'none'}}
                                onClick={this.showAddUser.bind(this)}
                            >
                                {lang('添加用户', 'Add User')}
                            </span>
                            <Table style={{marginTop: 15}} {...tableProps} />
                        </div>
                    }
                </Form>
                <CatalogTree onSelect={this.selectPath.bind(this)} ref={ref => this.catalogTreeWrapper = ref} />
                <AddLocalAuthUserToCIFS onAdd={this.addUserOrGroup.bind(this)} ref={ref => this.addLocalAuthUserToCIFSWrapper = ref} />
                <AddLocalAuthUserGroupToCIFS onAdd={this.addUserOrGroup.bind(this)} ref={ref => this.addLocalAuthUserGroupToCIFSWrapper = ref} />
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {share: {CIFSList}}} = state;
    return {language, CIFSList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateCIFS);