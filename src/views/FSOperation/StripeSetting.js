import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, Modal, message, Select, Spin, Popover} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class StripeSetting extends Component {
    constructor (props){
        super(props);
        this.minChunkSize = 65536;
        this.state = {
            visible: false,
            entryInfo: {},
            formSubmitting: false
        };
    }

    formValueChange (key, value){
        let entryInfo = Object.assign({}, this.state.entryInfo);
        if (key === 'buddyMirror'){
            value = (value === 'buddyMirror') ? 1 : 0;
        }
        entryInfo[key] = value;
        this.setState({entryInfo});
    }

    async editStripeSetting (){
        let {chunkSize} = this.state.entryInfo;
        if (chunkSize < this.minChunkSize){
            return message.error(lang('块大小不能小于64KB（65536Byte）', 'Chunk size can not be less than 64KB(65536Byte)'));
        }
        if (!((chunkSize > 0) && ((chunkSize & (chunkSize - 1)) === 0))){
            return message.error(lang('块大小必须是2的幂', 'Chunk size must be power of 2'));
        }
        this.setState({formSubmitting: true});
        try {
            await httpRequests.saveEntryInfo(this.state.entryInfo);
            this.hide();
            message.success(lang('条带设置保存成功！', 'Stripe setting has been saved successfully!'));
        } catch ({msg}){
            message.error(lang('条带设置保存失败，原因：', 'Stripe setting saving failed, reason: ') + msg);
        }
        this.setState({formSubmitting: false});
    }

    async show (path){
        await this.setState({
            visible: true,
            formSubmitting: false,
            entryInfo: {
                dirPath: path,
            }
        });
        let entryInfo = await httpRequests.getEntryInfo(path);
        this.setState({entryInfo});
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let {entryInfo} = this.state;
        let {language} = this.props;
        let isChinese = language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 8 : 8},
                sm: {span: isChinese ? 8 : 8},
            },
            wrapperCol: {
                xs: {span: isChinese ? 16 : 16},
                sm: {span: isChinese ? 16 : 16},
            }
        };
        return (
            <Modal
                title={lang('条带设置', 'Stripe Setting')}
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
                            loading={!entryInfo.hasOwnProperty('numTargets') || this.state.formSubmitting}
                            size='small' onClick={this.editStripeSetting.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
                        </Button>
                    </div>
                }
            >
                <Spin
                    indicator={<Icon type="loading" style={{fontSize: 18}} spin />}
                    spinning={!entryInfo.hasOwnProperty('numTargets')}
                >
                    <Form className="fs-stripe-form">
                        <Form.Item {...formItemLayout} label={lang('路径', 'Path')}>
                            <span>{entryInfo.dirPath}</span>
                        </Form.Item>
                        <Form.Item {...formItemLayout} label={lang('默认目标数', 'Default Targets')}>
                            <Input
                                style={{width: 140}}
                                size="small"
                                placeholder={lang('请输入默认目标数', 'enter default targets number')}
                                value={entryInfo.numTargets}
                                onChange={({target: {value}}) => this.formValueChange.bind(this, 'numTargets', value)()}
                            />
                        </Form.Item>
                        <Form.Item {...formItemLayout} label={lang('块大小', 'Block Size')}>
                            <Input
                                style={{width: 140}}
                                size="small"
                                placeholder={lang('请输入块大小', 'enter block size')}
                                value={entryInfo.chunkSize}
                                onChange={({target: {value}}) => this.formValueChange.bind(this, 'chunkSize', value)()}
                            /><span style={{marginLeft: 12}}>Byte</span>
                            <Popover
                                placement="right"
                                content={lang(
                                    '块大小不能小于 65536 Bytes，并且必须是2的幂',
                                    'Chunk size can not be less than 65536 Bytes, and must be power of 2'
                                )}
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-l" />
                            </Popover>
                        </Form.Item>
                        <Form.Item {...formItemLayout} label={lang('条带模式', 'Stripe Mode')}>
                            <Select
                                style={{width: 140}}
                                size="small"
                                placeholder={lang('请选择条带模式', 'select stripe mode')}
                                value={entryInfo.buddyMirror === 1 ? 'buddyMirror' : 'raid0'}
                                onChange={value => this.formValueChange.bind(this, 'buddyMirror', value)()}
                            >
                                <Select.Option value="raid0">RAID 0</Select.Option>
                                <Select.Option value="buddyMirror">BuddyMirror</Select.Option>
                            </Select>
                        </Form.Item>
                        {/*
                        <Form.Item {...formItemLayout} label={lang('元数据镜像', 'Metadata Image')}>
                            <Checkbox checked={stripe.isMetadataImage}
                                onChange={({target: {checked}}) => this.formValueChange.bind(this, 'isMetadataImage', checked)()}
                            />
                        </Form.Item>
                        */}
                        <Form.Item {...formItemLayout} label={lang('存储池ID', 'Storage Pool ID')}>
                            <span>{entryInfo.storagePoolId}</span>
                        </Form.Item>
                        <Form.Item {...formItemLayout} label={lang('存储池名称', 'Storage Pool Name')}>
                            <span>{entryInfo.storagePoolName}</span>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(StripeSetting);