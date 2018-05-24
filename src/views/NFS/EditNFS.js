import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Form, Input, message, Modal} from "antd";
import lang from "../../components/Language/lang";
import httpRequests from "../../http/requests";

class EditNFS extends Component {
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
            await httpRequests.updateNFSShare(shareData);
            httpRequests.getNFSShareList();
            await this.hide();
            message.success(lang('编辑NFS共享成功!', 'Edit NFS share successfully!'));
        } catch ({msg}){
            message.error(lang('编辑NFS共享失败, 原因: ', 'Edit NFS share failed, reason: ') + msg);
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
                title={lang('编辑NFS共享', 'Edit NFS Share')}
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditNFS);