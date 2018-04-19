import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Input, message, Modal} from 'antd';
import lang from "../../components/Language/lang";
import httpRequests from '../../http/requests';

class EditShare extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
            shareData: {
                path: '',
                protocol: '',
                description: ''
            },
        }
    }

    formValueChange (key, value){
        let shareData = Object.assign({}, this.state.shareData, {[key]: value});
        this.setState({shareData});
    }

    async editShare (){
        let shareData = Object.assign({}, this.state.shareData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.updateShare(shareData);
            httpRequests.getShareList();
            await this.hide();
            message.success(lang('编辑共享成功!', 'Edit share successfully!'));
            this.setState({formSubmitting: false});
        } catch ({msg}){
            message.success(lang('编辑共享失败, 原因: ', 'Edit share failed, reason: ') + msg);
            this.setState({formSubmitting: false});
        }
    }

    show (shareData){
        this.setState({
            visible: true,
            formSubmitting: false,
            shareData
        });
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        return (
            <Modal title={lang('编辑共享', 'Edit Share')}
                   width={320}
                   closable={false}
                   maskClosable={false}
                   visible={this.state.visible}
                   footer={
                       <div>
                           <Button type="primary" loading={this.state.formSubmitting}
                               size='small' onClick={this.editShare.bind(this)}
                           >
                               {lang('编辑', 'Edit')}
                           </Button>
                           <Button size='small' onClick={this.hide.bind(this)}>
                               {lang('取消', 'Cancel')}
                           </Button>
                       </div>
                   }
            >
                <Form>
                    <Form.Item label={lang('共享路径', 'Share Path')}>
                        {this.state.shareData.path}
                    </Form.Item>
                    <Form.Item label={lang('协议', 'Protocol')}>
                        {this.state.shareData.protocol}
                    </Form.Item>
                    <Form.Item label={lang('描述', 'Description')}>
                        <Input.TextArea style={{width: 240}} size="small"
                            autosize={{minRows: 2, maxRows: 4}}
                            placeholder={lang('共享描述为选填项', 'share description is optional')}
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
    const {language, main: {share: {shareList}}} = state;
    return {language, shareList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditShare);