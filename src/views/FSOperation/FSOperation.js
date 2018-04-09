import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, /*Checkbox,*/ Form, Icon, Input, message, Select, Table, Popover} from 'antd';
import lang from '../../components/Language/lang';
import {formatStorageSize} from '../../services';
import httpRequests from '../../http/requests';

class FSOperation extends Component {
    constructor (props){
        super(props);
        let {entryInfo} = props;
        this.minChunkSize = 65536;
        this.directoryStack = [];
        this.state = {
            dirPath: entryInfo.dirPath,
            entryInfo,
            readonly: false
        };
    }

    componentDidMount (){
        let defaultDirPath = this.state.dirPath || '/';
        // firstly put the root directory path '/' into directory stack as the earliest one
        this.directoryStack.unshift(defaultDirPath);
        // firstly fetch
        this.queryDirPath(defaultDirPath);
    }

    componentWillReceiveProps (nextProps){
        let {entryInfo} = nextProps;
        this.setState({entryInfo});
    }

    getFilesByPath (dirPath){
        try {
            httpRequests.getFiles(dirPath);
        } catch (e){
            message.error(lang('该路径下没有文件或文件夹', 'There are no directories or files under this path'));
        }
    }

    queryDirPath (dirPath = this.state.dirPath){
        // query files
        this.getFilesByPath(dirPath);
        // query entry info
        httpRequests.getEntryInfo(dirPath);
        // console.info(dirPath);
    }

    backTrackDirectoryStack (){
        let directoryStack = [...this.directoryStack];
        let dirPath = '';
        directoryStack.reverse().forEach(path => dirPath += path);
        this.setState({dirPath});
        return dirPath;
    }

    returnUpperDirectory (){
        this.directoryStack.shift();
        let lastDirPath = this.backTrackDirectoryStack();
        this.getFilesByPath(lastDirPath);
        httpRequests.getEntryInfo(lastDirPath);
    }

    enterDirectory (dirPath){
        this.directoryStack.unshift((this.directoryStack.length > 1 ? '/' : '') + dirPath);
        let nextDirPath = this.backTrackDirectoryStack();
        this.getFilesByPath(nextDirPath);
        httpRequests.getEntryInfo(nextDirPath);
    }

    getEntryInfo (dirPath, readonly){
        this.setState({readonly});
        let currentDirPath = this.backTrackDirectoryStack();
        currentDirPath = currentDirPath + (this.directoryStack.length > 1 ? '/' : '') + dirPath;
        httpRequests.getEntryInfo(currentDirPath);
    }

    entryInfoFormChange (key, value){
        let stripe = Object.assign({}, this.state.stripe);
        if (key === 'stripeMode'){
            value = (value === 'buddyMirror') ? 1 : 0;
        }
        stripe[key] = value;
        this.setState({stripe});
    }

    async saveStripeConfig (){
        if (this.state.stripe.chunkSize < this.minChunkSize){
            return message.error(lang('块大小不能小于64KB（65536Byte）', 'Chunk size can not be less than 64KB(65536Byte)'));
        }
        try {
            await httpRequests.saveEntryInfo(this.stripe);
            message.success(lang('条带设置保存成功！', 'Stripe setting has been saved successfully!'));
        } catch (e){
            message.error(e);
        }
    }

    render (){
        let {entryInfo} = this.state;
        let {files} = this.props;
        files = [...files];
        if (this.directoryStack.length > 1){
            files.unshift({name: '..', isDir: true});
        }
        let tableProps = {
            dataSource: files,
            pagination: false,
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无文件', 'No Files')
            },
            scroll: {y: 500},
            columns: [
                {title: lang('名称', 'Name'), width: 125, dataIndex: 'name',
                    render: (text, record) => (
                        record.isDir ?
                            ((text === '..' && !record.hasOwnProperty('user')) ?
                                <a onClick={this.returnUpperDirectory.bind(this, text)} title={lang('点击返回上层目录', 'Click Enter Upper Directory')}>
                                    <b>..</b>
                                </a> :
                                <a onClick={this.enterDirectory.bind(this, text)} title={lang('点击进入目录', 'Click Enter Directory')}>
                                    <Icon type="folder" /> {text}
                                </a>
                            ) :
                            <span><Icon type="file" /> {text}</span>
                    )
                },
                {title: lang('入口 / 大小', 'Entries / Size'), width: 120, dataIndex: 'size',
                    render: (text, record) => (
                        record.isDir && record.hasOwnProperty('user') ?
                            text + lang(' 入口', ' Entries') :
                            formatStorageSize(text)
                    )
                },
                {title: lang('用户', 'User'), width: 120, dataIndex: 'user'},
                {title: lang('组', 'Group'), width: 120, dataIndex: 'group'},
                {title: lang('权限', 'Permission'), width: 120, dataIndex: 'permissions'},
                /*
                {title: lang('最后状态时间', 'Last Status Time'), width: 125, dataIndex: 'lastStatusTime',
                    render: text => timeFormat(text)
                },
                {title: lang('最后修改时间', 'Last Modify Time'), width: 125, dataIndex: 'lastModifyTime',
                    render: text => timeFormat(text)
                },
                {title: lang('最后访问时间', 'Last Access Time'), width: 125, dataIndex: 'lastAccessTime',
                    render: text => timeFormat(text)
                },
                */
                {title: lang('操作', 'Operation'), width: 60,
                    render: (text, record) => (
                        record.isDir && record.hasOwnProperty('user') ?
                            <a onClick={() => {this.getEntryInfo.bind(this, record.name, false)()}} title={lang('设置', 'Settings')}>
                                <Icon style={{fontSize: 15}} type="setting" />
                            </a> :
                            (!record.isDir ?
                                <a onClick={() => {this.getEntryInfo.bind(this, record.name, true)()}} title={lang('显示', 'Settings')}>
                                    <Icon style={{fontSize: 15}} type="setting" />
                                </a> :
                                <a onClick={() => {this.returnUpperDirectory.bind(this)()}} title={lang('返回上一级', 'Return Upper Directory')}>
                                    <Icon style={{fontSize: 15}} type="rollback" />
                                </a>)
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
                            <Form.Item label={lang('路径', 'Path')}>
                                <Input placeholder={lang('请输入路径', 'enter path')} size="small"
                                       style={{width: 250}}
                                       value={this.state.dirPath}
                                       onChange={({target: {value}}) => {
                                           this.setState({dirPath: value});
                                       }}
                                />
                            </Form.Item>
                            <Form.Item className="fs-login-username-input-wrapper">
                                <Button shape="circle" icon="search" size="small"
                                        title={lang('获取路径信息', 'Fetch Path Information')}
                                        style={{display: 'inline-block'}}
                                        onClick={this.queryDirPath.bind(this)}
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
                                    <span>{entryInfo.dirPath}</span>
                                </Form.Item>
                                <Form.Item label={lang('默认目标数', 'Default Targets Number')}>
                                    <Input placeholder={lang('请输入默认目标数', 'enter default target number')} style={{width: 150}} size="small"
                                           value={entryInfo.numTargets}
                                           onChange={({target: {value}}) => {
                                               this.entryInfoFormChange.bind(this, 'numTargets', value)();
                                           }}
                                    />
                                </Form.Item>
                                <Form.Item label={lang('块大小', 'Block Size')}>
                                    <Input placeholder={lang('请输入块大小', 'enter block size')} style={{width: 150}} size="small"
                                           value={entryInfo.chunkSize}
                                           onChange={({target: {value}}) => {
                                               this.entryInfoFormChange.bind(this, 'chunkSize', value)();
                                           }}
                                    /><span style={{marginLeft: 12}}>Byte</span>
                                    <Popover content={lang('块大小不能小于65536Byte（64KB）', 'Chunk size can not be less than 65536Byte(64KB)')}>
                                        <Icon type="question-circle-o" className="fs-info-icon m-l" />
                                    </Popover>
                                </Form.Item>
                                <Form.Item label={lang('条带模式', 'Stripe Mode')}>
                                    <Select style={{width: 150}} size="small"
                                        placeholder={lang('请选择条带模式', 'select stripe mode')}
                                        value={entryInfo.buddyMirror === 1 ? 'buddyMirror' : 'raid0'}
                                        onChange={value => {
                                            this.entryInfoFormChange.bind(this, 'buddyMirror', value)();
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
                                            this.entryInfoFormChange.bind(this, 'isMetadataImage', checked)();
                                        }}
                                    />
                                </Form.Item>
                                */}
                                <Form.Item style={{marginTop: 20}} wrapperCol={{sm: {offset: 17}}}>
                                    <Button icon="save" size="small"
                                        disabled={this.state.readonly}
                                        onClick={this.saveStripeConfig.bind(this)}
                                    >
                                        {lang('保存', 'Save')}
                                    </Button>
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
    const {language, main: {fsOperation: {entryInfo, files}}} = state;
    return {language, entryInfo, files};
};

export default connect(mapStateToProps)(FSOperation);