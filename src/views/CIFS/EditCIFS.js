import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Form, Icon, Input, message, Modal, Popover, Select, Switch} from "antd";
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class EditCIFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
            shareData: {}
        };
    }

    formValueChange (key, value){
        let shareData = {[key]: value};
        shareData = Object.assign({}, this.state.shareData, shareData);
        this.setState({shareData});
    }

    async edit (){
        let shareData = Object.assign({}, this.state.shareData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.updateCIFSShare(shareData);
            httpRequests.getCIFSShareList();
            await this.hide();
            message.success(lang('编辑CIFS共享成功!', 'Edit CIFS share successfully!'));
        } catch ({msg}){
            message.error(lang('编辑CIFS共享失败, 原因: ', 'Edit CIFS share failed, reason: ') + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (shareData){
        this.setState({
            visible: true,
            formSubmitting: false,
            shareData
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
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
                title={lang('编辑CIFS共享', 'Edit CIFS Share')}
                width={420}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            loading={this.state.formSubmitting}
                            onClick={this.edit.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
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
                    <Form.Item {...formItemLayout} label={lang('名称', 'Name')}>
                        {this.state.shareData.name}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('路径', 'Path')}>
                        {this.state.shareData.path}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            style={{width: isChinese ? 280 : 260}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={200}
                            placeholder={lang('描述为选填项，长度0-200位', 'description is optional, length is 0-200')}
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
                                '启用本项后，一个客户端针对一个目录内的变更操作（如新增目录、新增文件、修改目录、修改文件等），可被其他正在访问此目录及其父目录的客户端感知，如自动刷新显示',
                                'After this option is enabled, if a client modifies a directory (such as adding directories, adding files, modifying directories, or modifying files), other clients that are accessing the directory or the parent directory of the directory can detect the modification. The modification is displayed after automatic refresh.'
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
                </Form>
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditCIFS);