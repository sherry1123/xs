import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, /*Checkbox,*/ Form, Icon, Input, message, Select, Table, Popover} from 'antd';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';
import CatalogTree from '../../components/CatalogTree/CatalogTree';

class FSOperation extends Component {
    constructor (props){
        super(props);
        // entry stripe
        let entryInfo = {
            dirPath: '/',
            numTargets: 0,
            chunkSize: 0,
            buddyMirror: 1,
            // isMetadataImage: true,
        };
        this.minChunkSize = 65536;
        // directory table
        this.queryDirLock = false;
        this.directoryStack = [];
        this.state = {
            dirPath: entryInfo.dirPath,
            files: [],
            entryInfo,
            entryInfoReadonly: false // files only allow read, directories allow read and set
        };
    }

    componentDidMount (){
        let defaultDirPath = this.state.dirPath || '/';
        // firstly put the root directory path '/' into directory stack as the earliest one
        this.directoryStack.unshift(defaultDirPath);
        // firstly fetch
        this.queryDirPath(defaultDirPath);
    }

    async getFilesByPath (dirPath, needBackIfError){
        this.queryDirLock = true;
        try {
            let files = await httpRequests.getFiles(dirPath);
            await this.setState({files, dirPath});
        } catch (e){
            // if query path error, need to remove previous one in directoryStack
            needBackIfError && this.directoryStack.shift();
            // should use code to distinguish it's network error or actually no such catalog
            message.warning(lang('该路径不存在', 'This path is not existed'));
        }
        this.queryDirLock = false;
    }

    async queryDirPath (dirPath = this.state.dirPath){
        this.CatalogTree.getWrappedInstance().show();

        // query files
        this.getFilesByPath(dirPath);
        // query entry info
        let entryInfo = await httpRequests.getEntryInfo(dirPath);
        this.setState({entryInfo});
        // console.info(dirPath);
    }

    backTrackDirectoryStack (){
        let directoryStack = [...this.directoryStack];
        let dirPath = '';
        directoryStack.reverse().forEach(path => dirPath += path);
        return dirPath;
    }

    async returnUpperDirectory (){
        if (!this.queryDirLock){
            this.directoryStack.shift();
            let lastDirPath = this.backTrackDirectoryStack(); // state => render
            this.getFilesByPath(lastDirPath); // props => render
            let entryInfo = await httpRequests.getEntryInfo(lastDirPath);
            this.setState({entryInfo});
        }
    }

    async enterDirectory (dirPath){
        if (!this.queryDirLock){
            this.directoryStack.unshift((this.directoryStack.length > 1 ? '/' : '') + dirPath);
            let nextDirPath = this.backTrackDirectoryStack();
            this.getFilesByPath(nextDirPath, true);
            let entryInfo = await httpRequests.getEntryInfo(nextDirPath);
            this.setState({entryInfo});
        }
    }

    async getEntryInfo (dirPath, entryInfoReadonly){
        this.setState({entryInfoReadonly});
        let currentDirPath = this.backTrackDirectoryStack();
        currentDirPath = currentDirPath + (this.directoryStack.length > 1 ? '/' : '') + dirPath;
        let entryInfo = await httpRequests.getEntryInfo(currentDirPath);
        this.setState({entryInfo});
    }

    entryInfoFormChange (key, value){
        let entryInfo = Object.assign({}, this.state.entryInfo);
        if (key === 'stripeMode'){
            value = (value === 'buddyMirror') ? 1 : 0;
        }
        entryInfo[key] = value;
        this.setState({entryInfo});
    }

    async saveStripeConfig (){
        let {chunkSize} = this.state.entryInfo;
        if (chunkSize < this.minChunkSize){
            return message.error(lang('块大小不能小于64KB（65536Byte）', 'Chunk size can not be less than 64KB(65536Byte)'));
        }
        if (!((chunkSize > 0) && ((chunkSize & (chunkSize - 1)) === 0))){
            return message.error(lang('块大小必须是2的幂', 'Chunk size must be power of 2'));
        }
        try {
            await httpRequests.saveEntryInfo(this.state.entryInfo);
            message.success(lang('条带设置保存成功！', 'Stripe setting has been saved successfully!'));
        } catch ({msg}){
            message.error(lang('条带设置保存失败，原因：', 'Stripe setting saving failed, reason: ') + msg);
        }
    }

    getPath (path){
        console.info(path);
    }

    render (){
        let {entryInfo, files} = this.state;
        files = files.filter(file => file.isDir);
        let {language} = this.props;
        if (this.directoryStack.length > 1){
            files.unshift({name: '..', isDir: true});
        }
        let tableProps = {
            dataSource: files,
            pagination: false,
            // loading: this.queryDirLock,
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无文件', 'No Files')
            },
            scroll: {y: 500},
            columns: [
                {title: lang('名称', 'Name'), width: 225, dataIndex: 'name',
                    render: (text, record) => (
                        record.isDir ?
                            ((text === '..' && !record.hasOwnProperty('user')) ?
                                <a onClick={this.returnUpperDirectory.bind(this, text)} title={lang('返回上层目录', 'Return Upper Directory')}>
                                    <b>..</b>
                                </a> :
                                <a onClick={this.enterDirectory.bind(this, text)} title={lang('进入目录', 'Enter Directory')}>
                                    <Icon type="folder" /> {text}
                                </a>
                            ) :
                            <span><Icon type="file" /> {text}</span>
                    )
                },
                {title: lang('目录数量', 'Catalog Number'), width: 80, dataIndex: 'size', render: text => text},
                {title: lang('用户', 'User'), width: 100, dataIndex: 'user'},
                {title: lang('组', 'Group'), width: 100, dataIndex: 'group'},
                {title: lang('权限', 'Permission'), width: 100, dataIndex: 'permissions'},
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
                                <a onClick={() => {this.returnUpperDirectory.bind(this)()}} title={lang('返回上层目录', 'Return Upper Directory')}>
                                    <Icon style={{fontSize: 15}} type="rollback" />
                                </a>)
                    )
                }
            ],
        };
        let isChinese = language === 'chinese';
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
            <section className="fs-page-content fs-operation-wrapper">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('文件系统操作', 'FS Operation')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-query-wrapper">
                        <Input.Search className="fs-search-table-input" size="small"
                            style={{width: 250}}
                            placeholder={lang('请输入路径', 'enter path')}
                            value={this.state.dirPath}
                            enterButton={true}
                            onChange={({target: {value}}) =>  this.setState({dirPath: value})}
                            onSearch={() => {this.queryDirPath.bind(this)()}}
                        />
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
                                <Form.Item {...formItemLayout} label={lang('路径', 'Path')}>
                                    <span>{entryInfo.dirPath}</span>
                                </Form.Item>
                                <Form.Item {...formItemLayout} label={lang('默认目标数', 'Default Targets')}>
                                    <Input
                                        style={{width: 140}} size="small"
                                        placeholder={lang('请输入默认目标数', 'enter default targets number')}
                                        value={entryInfo.numTargets}
                                        onChange={({target: {value}}) => {
                                            this.entryInfoFormChange.bind(this, 'numTargets', value)();
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item {...formItemLayout} label={lang('块大小', 'Block Size')}>
                                    <Input
                                        style={{width: 140}} size="small"
                                        placeholder={lang('请输入块大小', 'enter block size')}
                                        value={entryInfo.chunkSize}
                                        onChange={({target: {value}}) => {
                                            this.entryInfoFormChange.bind(this, 'chunkSize', value)();
                                        }}
                                    /><span style={{marginLeft: 12}}>Byte</span>
                                    <Popover
                                        placement="left"
                                        content={lang(
                                            '块大小不能小于 65536 Byte，并且必须是2的幂',
                                            'Chunk size can not be less than 65536 Byte, and must be power of 2'
                                        )}
                                    >
                                        <Icon type="question-circle-o" className="fs-info-icon m-l" />
                                    </Popover>
                                </Form.Item>
                                <Form.Item {...formItemLayout} label={lang('条带模式', 'Stripe Mode')}>
                                    <Select
                                        style={{width: 140}} size="small"
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
                                <Form.Item {...formItemLayout} label={lang('元数据镜像', 'Metadata Image')}>
                                    <Checkbox checked={stripe.isMetadataImage}
                                        onChange={({target: {checked}}) => {
                                            this.entryInfoFormChange.bind(this, 'isMetadataImage', checked)();
                                        }}
                                    />
                                </Form.Item>
                                */}
                                <Form.Item style={{marginTop: 20}} wrapperCol={{sm: {offset: 17}}}>
                                    <Button
                                        icon="save" size="small"
                                        disabled={this.state.entryInfoReadonly}
                                        onClick={this.saveStripeConfig.bind(this)}
                                    >
                                        {lang('保存', 'Save')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </section>
                    </section>
                </div>
                <CatalogTree ref={ref => this.CatalogTree = ref} onSelect={this.getPath.bind(this)} />
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

export default connect(mapStateToProps)(FSOperation);