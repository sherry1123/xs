import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Checkbox, Form, Icon, Input, Modal, Popover, Select} from "antd";
import CatalogTree from '../../components/CatalogTree/CatalogTree';
import lang from "../../components/Language/lang";
import {validateFsName} from "../../services";

class CreateCIFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            showClient: false,
            formValid: false,
            formSubmitting: false,
            shareData: {
                path: '',
                name: '',
                description: '',
                oplock: true,
                notify: true,
                offlineCacheMode: 'manual',
                userList: []
            },
            validation: {
                path: {status: '', help: '', valid: false},
                name: {status: '', help: '', valid: false},
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
        await this.validationUpdateState(key, {cn: '', en: ''}, true);
        let {path, name} = this.state.shareData;
        if (key === 'path'){
            if (!path){
                this.validationUpdateState('path', {cn: '请选择需要做NFS共享的目录路径', en: 'Please select the share catalog path'}, false);
            }
        }

        if (key === 'name'){
            if (!validateFsName(name)){
                await this.validationUpdateState('name', {
                    cn: '名称仅允许字母、数字以及下划线（下划线不得位于首位或末尾位）的组合，长度3-30位',
                    en: 'Name can only contains letter, number and underscore(except for the first), length is 3-30.'
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

    showCatalogTree (){
        this.catalogTreeWrapper.getWrappedInstance().show();
    }

    async selectPath (path){
        console.info(path);
        let shareData = Object.assign(this.state.shareData, {path});
        await this.setState({shareData});
        this.validateForm('path');
    }

    create (){

    }

    show (){
        this.setState({
            visible: true,
            showClient: false,
            formValid: false,
            formSubmitting: false,
            shareData: {
                path: '',
                name: '',
                description: '',
                oplock: true,
                notify: true,
                offlineCacheMode: 'manual',
                clientList: []
            },
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0, placement: 'right'};
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
        return (
            <Modal
                title={lang('创建CIFS共享', 'Create CIFS Share')}
                width={420}
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
                            style={{width: isChinese ? 260 : 220}} size="small"
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
                    <Form.Item
                        {...formItemLayout}
                        label={lang('共享名称', 'Share Name')}
                        validateStatus={this.state.validation.name.status}
                        help={this.state.validation.name.help}
                    >
                        <Input
                            style={{width: isChinese ? 260 : 220}} size="small"
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
                            style={{width: isChinese ? 260 : 220}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={255}
                            placeholder={lang('描述为选填项，长度0-255位', 'Description is optional, length is 0-255')}
                            value={this.state.shareData.description}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'description')(value);
                            }}
                        />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Oplock">
                        <Checkbox
                            checked={this.state.shareData.oplock}
                            onChange={({target: {checked}}) => {
                                this.formValueChange.bind(this, 'oplock')(checked);
                            }}
                        />
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
                        <Checkbox
                            checked={this.state.shareData.notify}
                            onChange={({target: {checked}}) => {
                                this.formValueChange.bind(this, 'notify')(checked);
                            }}
                        />
                        <Popover
                            {...buttonPopoverConf}
                            content={lang(
                                '勾选本项后，一个客户端针对一个目录内的变更操作（如新增目录、新增文件、修改目录、修改文件等），可被其他正在访问此目录及其父目录的客户端感知，如自动刷新显示。',
                                'After this option is selected, if a client modifies a directory (such as adding directories, adding files, modifying directories, or modifying files), other clients that are accessing the directory or the parent directory of the directory can detect the modification. The modification is displayed after automatic refresh.'
                            )}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-ll" />
                        </Popover>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('离线缓存模式', 'Offline Cache Mode')}>
                        <Select
                            style={{width: isChinese ? 260 : 220}}
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
                </Form>
                <CatalogTree onSelect={this.selectPath.bind(this)} ref={ref => this.catalogTreeWrapper = ref} />
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateCIFS);