import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, Form, Input, message, Modal} from 'antd';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    const {language, main: {snapshot: {snapshotList}}} = state;
    return {language, snapshotList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
export default class EditSnapshot extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
            snapshotData: {
                name: '',
                description: ''
            }
        };
    }

    formValueChange (key, value){
        let snapshotData = Object.assign({}, this.state.snapshotData, {[key]: value});
        this.setState({snapshotData});
    }

    async editSnapshot (){
        let snapshotData = Object.assign({}, this.state.snapshotData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.updateSnapshot(snapshotData);
            httpRequests.getSnapshotList();
            await this.hide();
            message.success(lang('编辑快照成功!', 'Edit snapshot successfully!'));
        } catch ({msg}){
            message.error(lang('编辑快照失败, 原因: ', 'Edit snapshot failed, reason: ') + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (snapshotData){
        this.setState({
            visible: true,
            formSubmitting: false,
            snapshotData,
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 3 : 6},
                sm: {span: isChinese ? 3 : 6},
            },
            wrapperCol: {
                xs: {span: isChinese ? 21 : 18},
                sm: {span: isChinese ? 21 : 18},
            }
        };

        return (
            <Modal
                title={lang('编辑快照', 'Edit Snapshot')}
                width={400}
                visible={this.state.visible}
                closable={false}
                maskClosable={false}
                footer={
                    <div>
                        <Button
                            size='small'
                            disabled={this.state.formSubmitting}
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            type="primary"
                            loading={this.state.formSubmitting}
                            size='small' onClick={this.editSnapshot.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item {...formItemLayout} label={lang('名称', 'Name')}>
                        {this.state.snapshotData.name}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            size='small'
                            autosize={{minRows: 4, maxRows: 6}}
                            placeholder={lang('描述为可选项，长度为0-200', 'Description is optional, length is 0-200')}
                            value={this.state.snapshotData.description}
                            maxLength={200}
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