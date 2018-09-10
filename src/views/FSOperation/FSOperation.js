import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Input, message, Table, Popover} from 'antd';
import StripeSetting from './StripeSetting';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class FSOperation extends Component {
    constructor (props){
        super(props);
        this.minChunkSize = 65536;
        // directory table
        this.queryDirLock = false;
        this.directoryStack = [];
        this.state = {
            dirPath: '/',
            files: [],
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
        // query files
        this.getFilesByPath(dirPath);
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
        }
    }

    async enterDirectory (dirPath){
        if (!this.queryDirLock){
            this.directoryStack.unshift((this.directoryStack.length > 1 ? '/' : '') + dirPath);
            let nextDirPath = this.backTrackDirectoryStack();
            this.getFilesByPath(nextDirPath, true);
        }
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

    stripeSetting ({path}){
        this.stripeSettingWrapper.getWrappedInstance().show(path);
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {files} = this.state;
        if (this.directoryStack.length > 1){
            files.unshift({name: '..', path: '..'});
        }
        let tableProps = {
            dataSource: files,
            pagination: false,
            // loading: this.queryDirLock,
            rowKey: 'path',
            locale: {
                emptyText: lang('暂无文件目录', 'No File Catalog')
            },
            scroll: {y: 500},
            title: () => (<span className="fs-table-title"><Icon type="setting" />{lang('文件系统操作', 'File System Operation')}</span>),
            columns: [
                {title: lang('名称', 'Name'), width: 225, dataIndex: 'name',
                    render: (text, record) => (
                        (text === '..' && !record.hasOwnProperty('user')) ?
                            <a
                                onClick={this.returnUpperDirectory.bind(this, text)}
                                title={lang('返回上层目录', 'Return Upper Directory')}
                            >
                                <b>..</b>
                            </a> :
                            <a
                                onClick={this.enterDirectory.bind(this, text)}
                                title={lang('进入目录', 'Enter Directory')}
                            >
                                <Icon type="folder" /> {text}
                            </a>
                    )
                },
                {title: lang('目录数量', 'Catalog Number'), width: 80, dataIndex: 'size', render: text => text},
                {title: lang('用户', 'User'), width: 100, dataIndex: 'user'},
                {title: lang('组', 'Group'), width: 100, dataIndex: 'group'},
                {title: lang('系统级权限', 'System Level Permission'), width: 100, dataIndex: 'permissions'},
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
                        record.hasOwnProperty('user') ?
                            <Popover {...buttonPopoverConf} content={lang('条带设置', 'Stripe Setting')}>
                                <Button
                                    {...buttonConf}
                                    icon="setting"
                                    onClick={this.stripeSetting.bind(this, record)}
                                />
                            </Popover> :
                            <Popover {...buttonPopoverConf} content={lang('返回上层目录', 'Return Upper Directory')}>
                                <Button
                                    {...buttonConf}
                                    icon="rollback"
                                    onClick={this.returnUpperDirectory.bind(this)}
                                />
                            </Popover>
                    )
                }
            ],
        };

        return (
            <section className="fs-page-content fs-operation-wrapper">
                <div className="fs-table-operation-wrapper">
                    <Input.Search
                        size="small"
                        placeholder={lang('请输入文件目录路径', 'Please enter file directory path')}
                        value={this.state.dirPath}
                        onChange={({target: {value}}) => this.setState({dirPath: value})}
                        onSearch={() => {this.queryDirPath.bind(this)()}}
                    />
                </div>
                <div className="fs-main-content-wrapper">
                    <Table {...tableProps} />
                </div>
                <StripeSetting ref={ref => this.stripeSettingWrapper = ref} />
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

export default connect(mapStateToProps)(FSOperation);