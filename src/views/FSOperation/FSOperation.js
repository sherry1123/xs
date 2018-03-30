import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, /*Checkbox,*/ Form, Icon, Input, Select, Table} from 'antd';
import lang from '../../components/Language/lang';
import {timeFormat} from "../../services";

class FSOperation extends Component {
    constructor (props){
        super(props);
        let {stripe} = props;
        this.state = {
            path: stripe.dirPath,
            stripe
        };
    }

    componentWillReceiveProps (nextProps){
        let {stripe} = nextProps;
        this.setState({
            path: stripe.dirPath,
            stripe
        });
    }

    queryPath (path){
        // query file

        // query stripe

        console.info(path);
    }

    forwardStripeSettings (){

    }

    stripeFormChange (key, value){
        let stripe = Object.assign({}, this.state.stripe);
        if (key === 'stripeMode'){
            value = (value === 'buddyMirror') ? 1 : 0;
        }
        stripe[key] = value;
        this.setState({stripe});
    }

    saveStripeConfig (){

    }

    render (){
        let {fileList} = this.props;
        let {stripe} = this.state;
        let tableProps = {
            dataSource: fileList,
            pagination: false,
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无文件', 'No Files')
            },
            scroll: {y: 500},
            columns: [
                {title: lang('名称', 'Name'), width: 125, dataIndex: 'name'},
                {title: lang('入口', 'Portal'), width: 70, dataIndex: 'portal'},
                {title: lang('用户/权限/组', 'User/Perm/Group'), width: 120, dataIndex: 'user',
                    render: (text, record) => `${text}/${record.permission}/${record.group}`
                },
                {title: lang('最后状态时间', 'Last Status Time'), width: 125, dataIndex: 'lastStatusTime',
                    render: text => timeFormat(text)
                },
                {title: lang('最后修改时间', 'Last Modify Time'), width: 125, dataIndex: 'lastModifyTime',
                    render: text => timeFormat(text)
                },
                {title: lang('最后访问时间', 'Last Access Time'), width: 125, dataIndex: 'lastAccessTime',
                    render: text => timeFormat(text)
                },
                {title: lang('操作', 'Ops'), width: 40,
                    render: () => (
                        <div>
                            <a onClick={this.forwardStripeSettings.bind(this)} title={lang('设置', 'Settings')}>
                                <Icon style={{fontSize: 15}} type="setting" />
                            </a>
                        </div>
                    )
                }
            ],
        };
        return (
            <section className="fs-page-content fs-operation-wrapper">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('文件系统操作', 'FS Operation')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-query-wrapper">
                        <Form layout="inline">
                            <Form.Item label={lang('文件路径', 'File Path')}>
                                <Input placeholder={lang('请输入路径', 'enter path')} size="small"
                                       style={{width: 250}}
                                       value={this.state.path}
                                       onChange={({target: {value}}) => {
                                           this.setState({path: value});
                                           this.queryPath.bind(this, value)();
                                       }}
                                />
                            </Form.Item>
                            <Form.Item className="fs-login-username-input-wrapper">
                                <Button shape="circle" icon="search" size="small"
                                        title={lang('获取路径信息', 'Fetch Path Information')}
                                        style={{display: 'inline-block'}}
                                />
                            </Form.Item>
                        </Form>
                    </section>
                </section>
                <div className="fs-page-item-group">
                    <section className="fs-page-item-wrapper fs-file-wrapper">
                        <h3 className="fs-page-title item">{lang('浏览文件', 'Browse File')}</h3>
                        <section className="fs-page-item-content">
                            <Table {...tableProps} />
                        </section>
                    </section>
                    <section className="fs-page-item-wrapper fs-stripe-wrapper">
                        <h3 className="fs-page-title item">{lang('条带信息', 'Stripe Information')}</h3>
                        <section className="fs-page-item-content">
                            <Form className="fs-stripe-form">
                                <Form.Item label={lang('路径', 'Path')}>
                                    <span>{stripe.dirPath}</span>
                                </Form.Item>
                                <Form.Item label={lang('默认目标数', 'Default Targets Number')}>
                                    <Input placeholder={lang('请输入默认目标数', 'enter default target number')} style={{width: 190}} size="small"
                                           value={stripe.numTargets}
                                           onChange={({target: {value}}) => {
                                               this.stripeFormChange.bind(this, 'defaultTargetNumber', value)();
                                           }}
                                    />
                                </Form.Item>
                                <Form.Item label={lang('块大小', 'Block Size')}>
                                    <Input placeholder={lang('请输入块大小', 'enter block size')} style={{width: 150}} size="small"
                                           value={stripe.chunkSize}
                                           onChange={({target: {value}}) => {
                                               this.stripeFormChange.bind(this, 'blockSize', value)();
                                           }}
                                    /><span style={{marginLeft: 12}}>{lang('字节', 'Byte')}</span>
                                </Form.Item>
                                <Form.Item label={lang('条带模式', 'Stripe Mode')}>
                                    <Select style={{width: 190}} size="small"
                                            placeholder={lang('请选择条带模式', 'select stripe mode')}
                                            value={stripe.buddyMirror === 1 ? 'buddyMirror' : 'raid0'}
                                            onChange={value => {
                                                this.stripeFormChange.bind(this, 'buddyMirror', value)();
                                            }}
                                    >
                                        <Select.Option value="raid0">RAID 0</Select.Option>
                                        <Select.Option value="buddyMirror">BuddyMirror</Select.Option>
                                    </Select>
                                </Form.Item>
                                {/*
                                 <Form.Item label={lang('元数据镜像', 'Metadata Image')} {...formItemLayout}>
                                    <Checkbox checked={stripe.isMetadataImage}
                                        onChange={({target: {checked}}) => {
                                            this.stripeFormChange.bind(this, 'isMetadataImage', checked)();
                                        }}
                                    />
                                </Form.Item>
                                */}
                                <Form.Item style={{marginTop: 20}} wrapperCol={{sm: {offset: 18}}}>
                                    <Button icon="save" size="small" onClick={this.saveStripeConfig.bind(this)}>{lang('保存', 'Save')}</Button>
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
    const {language, main: {fsOperation: {stripe, fileList}}} = state;
    return {language, stripe, fileList};
};

export default connect(mapStateToProps)(FSOperation);