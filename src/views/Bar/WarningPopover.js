import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Tabs, Table, Button} from 'antd';
import {formatTime} from 'Services';

const mapStateToProps = state => {
    let {language,} = state;
    return {language};
};

@connect(mapStateToProps)
export default class WarningPopover extends Component {
    readEventLog (){
        //
    }

    render (){
        let tableProps = {
            locale: {
                emptyText: lang('暂无告警', 'No Warning')
            },
            style: {maxWidth: '350px', cursor: 'pointer'},
            size: 'small',
            scroll: {y: 245},
            showHeader: false,
            pagination: false,
            rowKey: record => `${record.time}${record.read}${record.descr}${record.node}${record.level}${record.source}`,
            onRow: record => {
                if (!record.read){
                    this.readEventLog.bind(this, record)();
                }
            },
            columns: [{
                title: lang('节点', 'Node'),
                width: 80,
                dataIndex: 'node',
                key: 'node',
                render: (text, record) => record.read ? (text || 'cluster') : <b>{text || 'cluster'}</b>,
            }, {
                title: lang('描述', 'Description'),
                width: 150,
                dataIndex: 'descr',
                key: 'descr',
                render: (text, record) => record.read ? text : <b>{text}</b>
            }, {
                title: lang('时间', 'Time'),
                width: 100,
                dataIndex: 'time',
                key: 'time',
                render: (text, record) => record.read ? formatTime(text) : <b>{formatTime(text)}</b>
            }],
            footer: () => {
                return (
                    <Button size="small">
                        {lang('清除所有告警', 'Clear All Warnings')}
                    </Button>
                );
            }
        };
        return (
            <Tabs defaultActiveKey="1" size="small" style={{maxWidth: '350px'}}>
                <Tabs.TabPane key="1" tab={`${lang('轻度警告', 'Low Warning')}`}>
                    <Table {...tableProps} dataSource={[]}/>
                </Tabs.TabPane>
                <Tabs.TabPane key="2" tab={`${lang('中度警告', 'Moderate Warning')}`}>
                    <Table {...tableProps} dataSource={[]}/>
                </Tabs.TabPane>
                <Tabs.TabPane key="3" tab={`${lang('严重警告', 'Serious Warning')}`}>
                    <Table {...tableProps} dataSource={[]}/>
                </Tabs.TabPane>
            </Tabs>
        );
    }
}