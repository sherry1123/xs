import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, /*Checkbox, */Form, Input, Select} from 'antd';
import lang from '../../components/Language/lang';

class FSOperationStripeSettings extends Component {
    constructor (props){
        super(props);
        let {stripeInformation} = props;
        this.state = {
            stripeQuery: stripeInformation.path,
            stripeInformation
        };
    }

    componentWillReceiveProps (nextProps){
        let {stripeInformation} = nextProps;
        this.setState({
            stripeQuery: stripeInformation.path,
            stripeInformation
        });
    }

    formChange (key, value){
        let newStripeInfo = Object.assign({}, this.state.stripeInformation);
        newStripeInfo[key] = value;
        this.setState({stripeInformation: newStripeInfo});
    }

    submit (){

    }

    render (){
        let formItemLayout = {
            labelCol: {span: 8},
        };
        return (
            <section className="fs-page-content fs-operation-wrapper">
                <section className="fs-page-item-wrapper title">
                    <h3 className="fs-page-title">{lang('条带设置', 'Stripe Settings')}</h3>
                </section>
                <section className="fs-page-item-wrapper fs-stripe-query-wrapper">
                    <h3 className="fs-page-title item">{lang('获取路径信息', 'Fetch Path Information')}</h3>
                    <section className="fs-page-item-content">
                        <Form layout="inline">
                            <Form.Item label={lang('路径', 'Path')}>
                                <Input placeholder={lang('请输入路径', 'enter path')} style={{width: 400}}
                                    value={this.state.stripeQuery}
                                    onChange={({target: {value}}) => {
                                        this.setState({stripeQuery: value});
                                    }}
                                />
                            </Form.Item>
                            <Form.Item className="fs-login-username-input-wrapper">
                                <Button shape="circle" icon="search"
                                    title={lang('获取信息', 'Fetch Information')}
                                    style={{display: 'inline-block'}}
                                />
                                <Button shape="circle" icon="folder-open"
                                    title={lang('浏览文件', 'Browse File')}
                                    style={{display: 'inline-block', marginLeft: 20}}
                                />
                            </Form.Item>
                        </Form>
                    </section>
                </section>
                <div className="fs-page-item-group">
                    <section className="fs-page-item-wrapper fs-stripe-wrapper">
                        <h3 className="fs-page-title item">{lang('条带信息', 'Stripe Information')}</h3>
                        <section className="fs-page-item-content">
                            <Form layout="horizontal">
                                <Form.Item label={lang('路径', 'Path')} {...formItemLayout}>
                                    <span>{this.state.stripeInformation.path}</span>
                                </Form.Item>
                                <Form.Item label={lang('默认目标数', 'Default Targets Number')} {...formItemLayout}>
                                    <Input placeholder={lang('请输入默认目标数', 'enter default target number')} style={{width: 190}}
                                        value={this.state.stripeInformation.defaultTargetNumber}
                                        onChange={({target: {value}}) => {
                                            this.formChange.bind(this, 'defaultTargetNumber', value)();
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item label={lang('块大小', 'Block Size')} {...formItemLayout}>
                                    <Input placeholder={lang('请输入块大小', 'enter block size')} style={{width: 150}}
                                        value={this.state.stripeInformation.blockSize}
                                        onChange={({target: {value}}) => {
                                           this.formChange.bind(this, 'blockSize', value)();
                                        }}
                                    /><span style={{marginLeft: 12}}>{lang('字节', 'Byte')}</span>
                                </Form.Item>
                                <Form.Item label={lang('条带模式', 'Stripe Mode')} {...formItemLayout}>
                                    <Select style={{width: 190}}
                                        placeholder={lang('请选择条带模式', 'select stripe mode')}
                                        value={this.state.stripeInformation.stripeMode}
                                        onChange={value => {
                                            this.formChange.bind(this, 'stripeMode', value)();
                                        }}
                                    >
                                        <Select.Option value="raid0">RAID 0</Select.Option>
                                        <Select.Option value="buddyMirror">BuddyMirror</Select.Option>
                                    </Select>
                                </Form.Item>
                                {/*
                                 <Form.Item label={lang('元数据镜像', 'Metadata Image')} {...formItemLayout}>
                                    <Checkbox checked={this.state.stripeInformation.isMetadataImage}
                                        onChange={({target: {checked}}) => {
                                            this.formChange.bind(this, 'isMetadataImage', checked)();
                                        }}
                                    />
                                </Form.Item>
                                */}
                                <Form.Item wrapperCol={{sm: {offset: 8}}}>
                                    <Button icon="save" onClick={this.submit.bind(this)}>{lang('保存', 'Save')}</Button>
                                </Form.Item>
                            </Form>
                        </section>
                    </section>
                    <section className="fs-page-item-wrapper fs-location-wrapper">
                        <h3 className="fs-page-title item">{lang('位置', 'Location')}</h3>
                        <section className="fs-page-item-content">
                            <Form layout="horizontal">
                                <Form.Item label={lang('元数据目标', 'Metadata Target')} {...formItemLayout}>
                                    <span>/etc/orcafs/mt</span>
                                </Form.Item>
                                <Form.Item label={lang('元数据目标镜像', 'Metadata Target Image')} {...formItemLayout}>
                                    <span>/etc/orcafs/mti</span>
                                </Form.Item>
                                <Form.Item label={lang('存储目标', 'Storage Target')} {...formItemLayout}>
                                    <span>/etc/orcafs/st</span>
                                </Form.Item>
                                <Form.Item label={lang('存储目标镜像', 'Storage Target Image')} {...formItemLayout}>
                                    <span>/etc/orcafs/sti</span>
                                </Form.Item>
                            </Form>
                        </section>
                    </section>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {stripeInformation}} = state;
    return {language, stripeInformation};
};

export default connect(mapStateToProps)(FSOperationStripeSettings);