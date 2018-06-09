import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, message, Modal, Select} from 'antd';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';

class EditUserOrGroupOfCIFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: true,
            formSubmitting: false,
            share: {},
            itemData: {},
        };
    }

    async edit (){
        let {share: {name: shareName, path: sharePath}} = this.state;
        let itemData = Object.assign({}, this.state.itemData, {shareName, sharePath});
        this.setState({formSubmitting: true});
        try {
            await httpRequests.updateLocalAuthUserOrGroupInCIFSShare(itemData);
            httpRequests.getLocalAuthUserOrGroupListByCIFSShareName(this.state.share.name);
            await this.hide();
            message.success(lang(`编辑本地认证用户 ${itemData.name} 成功!`, `Edit local authentication user ${itemData.name} successfully!`));
        } catch ({msg}){
            message.error(lang(`编辑本地认证用户 ${itemData.name} 失败, 原因: `, `Edit local authentication user ${itemData.name} failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    show ({share, itemData}){
        this.setState({
            visible: true,
            formValid: true,
            formSubmitting: false,
            share,
            itemData,
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
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
        return (
            <Modal
                title={lang('编辑用户/用户组', 'Edit User/User Group')}
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
                        <Button
                            size="small"
                            type="primary"
                            loading={this.state.formSubmitting}
                            onClick={this.edit.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item {...formItemLayout} label={lang('名称', 'Name')}>
                        {this.state.itemData.name}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('类型', 'Type')}>
                        {this.state.itemData.name}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('权限', 'Permission')}>
                        <Select
                            style={{marginLeft: 10, width: isChinese ? 90 : 130}}
                            size="small"
                            value={this.state.itemData.permission}
                            onChange={value => {
                                let itemData = Object.assign({}, this.state.itemData);
                                itemData.permission = value;
                                this.setState({itemData});
                            }}
                        >
                            {/*<Select.Option value="full-control">{lang('完全控制', 'Full control')}</Select.Option>*/}
                            <Select.Option value="read_and_write">{lang('读写', 'Read and write')}</Select.Option>
                            <Select.Option value="readonly">{lang('只读', 'Readonly')}</Select.Option>
                            <Select.Option value="forbidden">{lang('禁止', 'Forbidden')}</Select.Option>
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditUserOrGroupOfCIFS);