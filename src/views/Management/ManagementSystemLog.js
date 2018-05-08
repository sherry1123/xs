import React, {Component} from "react";
import {connect} from "react-redux";
import {Icon, Table, Tabs} from "antd";
import lang from '../../components/Language/lang';
import {timeFormat} from "../../services";
import httpRequests from "../../http/requests";

class ManagementSystemLog extends Component {
    componentDidMount (){
        httpRequests.getEventLogs();
        httpRequests.getAuditLogs();
    }

    render (){
        let {language, eventLogs, auditLogs} = this.props;
        let eventLogProps = {
            dataSource: eventLogs,
            pagination: {
                pageSize: 15,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
                size: 'normal'
            },
            size: 'small',
            rowKey: '_id',
            className: 'fs-log-table-wrapper',
            locale: {
                emptyText: lang('暂无日志', 'No Logs')
            },
            columns: [{
                width: 60,
                align: 'center',
                dataIndex: 'level',
                key: 'level_circle',
                render: text => <i className={`fs-log-level-circle level-${text}`} />
            }, {
                title: lang('节点', 'Node'),
                dataIndex: 'node',
                key: 'node',
                render: (text, record) => record.node ? record.node : 'cluster'
            }, {
                title: lang('事件描述', 'Description'),
                dataIndex: 'desc',
                key: 'desc',
                render: text => text[language]
            }, {
                title: lang('等级', 'Level'),
                dataIndex: 'level',
                key: 'level',
                render: (text, record) => {
                    return record.level * 1 === 1 ? lang('低', 'Low') : (record.level * 1 === 2 ? lang('中', 'Warn') : lang('高', 'Fatal'));
                }
            }, {
                title: lang('时间', 'Time'),
                dataIndex: 'time',
                key: 'time',
                render: text => timeFormat(text)
            }]
        };
        let auditLogProps = {
            dataSource: auditLogs,
            pagination: {
                pageSize: 15,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
                size: 'normal'
            },
            size: 'small',
            rowKey: '_id',
            className: 'fs-log-table-wrapper',
            locale: {
                emptyText: lang('暂无日志', 'No Logs')
            },
            columns: [{
                title: lang('用户名称', 'Username'),
                dataIndex: 'user',
                key: 'user',
            }, {
                title: lang('用户类型', 'User Type'),
                dataIndex: 'group',
                key: 'group',
                render: text => text[language]
            }, {
                title: lang('用户登录地址', 'User Login IP'),
                dataIndex: 'ip',
                key: 'ip',
            }, {
                title: lang('事件描述', 'Event Description'),
                dataIndex: 'desc',
                key: 'desc',
                render: text => text[language]
            }, {
                title: lang('时间', 'Time'),
                dataIndex: 'time',
                key: 'time',
                render: text => timeFormat(text)
            }]
        };

        return (
            <section className="fs-page-content fs-management-system-log">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('系统日志', 'System Log')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-log-tab-wrapper">
                        <Tabs defaultActiveKey="event">
                            <Tabs.TabPane tab={<span><Icon type="laptop" />{lang('事件日志','Event Log')}</span>} key="event">
                                <Table {...eventLogProps} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={<span><Icon type="user" />{lang('审计日志','Audit Log')}</span>} key="audit">
                                <Table {...auditLogProps} />
                            </Tabs.TabPane>
                        </Tabs>
                    </section>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {management: {eventLogs, auditLogs}}} = state;
    return {language, eventLogs, auditLogs};
};

export default connect(mapStateToProps)(ManagementSystemLog);
