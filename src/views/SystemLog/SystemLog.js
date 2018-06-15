import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Radio, Table} from 'antd';
import lang from '../../components/Language/lang';
import {timeFormat} from '../../services';
import httpRequests from '../../http/requests';

class SystemLog extends Component {
    constructor (props){
        super(props);
        this.state = {
            showLogType: 'audit'
        };
    }

    componentDidMount (){
        httpRequests.getEventLogs();
        httpRequests.getAuditLogs();
    }

    render (){
        let {language, eventLogs, auditLogs} = this.props;
        let eventLogProps = {
            dataSource: eventLogs,
            pagination: eventLogs.length > 12 && {
                pageSize: 12,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items`
                ),
                size: 'normal'
            },
            rowKey: '_id',
            locale: {
                emptyText: lang('暂无事件日志', 'No Event Logs')
            },
            title: () => (<span className="fs-table-title"><Icon type="laptop" />{lang('事件日志', 'Event Log')}</span>),
            columns: [
                {width: '2%', align: 'center', dataIndex: 'level', key: 'level_circle',
                    render: text => <i className={`fs-log-level-circle level-${text}`} />
                },
                {width: '18%', title: lang('节点', 'Node'), dataIndex: 'node', key: 'node',
                    render: (text, record) => record.node ? record.node : 'cluster'
                },
                {width: '50%', title: lang('事件描述', 'Description'), dataIndex: 'desc', key: 'desc',
                    render: text => text[language]
                },
                {width: '10%', title: lang('等级', 'Level'), dataIndex: 'level', key: 'level',
                    render: (text, record) => record.level * 1 === 1 ? lang('低', 'Low') : (record.level * 1 === 2 ? lang('中', 'Warn') : lang('高', 'Fatal'))
                },
                {width: '20%', title: lang('上报时间', 'Reported Time'), dataIndex: 'time', key: 'time',
                    render: text => timeFormat(text)
                }
            ]
        };
        let auditLogProps = {
            dataSource: auditLogs,
            pagination: auditLogs.length > 12 && {
                pageSize: 12,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items`
                ),
                size: 'normal'
            },
            rowKey: '_id',
            locale: {
                emptyText: lang('暂无审计日志', 'No Audit Logs')
            },
            title: () => (<span className="fs-table-title"><Icon type="user" />{lang('审计日志', 'Audit Log')}</span>),
            columns: [
                {width: '2%', align: 'center', dataIndex: 'level', key: 'level_circle',
                    render: text => <i className={`fs-log-level-circle level-${text}`} />
                },
                {width: '15%', title: lang('用户名称', 'Username'), dataIndex: 'user', key: 'user',},
                {width: '10%', title: lang('用户类型', 'User Type'), dataIndex: 'group', key: 'group',
                    render: text => text[language]
                },
                {width: '10%', title: lang('用户登录地址', 'User Login IP'), dataIndex: 'ip', key: 'ip',},
                {width: '43%', title: lang('事件描述', 'Event Description'), dataIndex: 'desc', key: 'desc',
                    render: text => text[language]
                },
                {width: '15%', title: lang('上报时间', 'Reported Time'), dataIndex: 'time', key: 'time',
                    render: text => timeFormat(text)
                }
            ]
        };

        return (
            <section className="fs-page-content fs-management-system-log">
                <div className="fs-table-operation-wrapper">
                    <Radio.Group
                        value={this.state.showLogType}
                        onChange={({target: {value}}) => this.setState({showLogType: value})}
                    >
                        <Radio value="audit">{lang('审计日志', 'Audit Log')}</Radio>
                        <Radio value="event">{lang('事件日志', 'Event Log')}</Radio>
                    </Radio.Group>
                </div>
                <div className="fs-main-content-wrapper">
                    {
                        this.state.showLogType === 'event' ? <Table {...eventLogProps} /> : <Table {...auditLogProps} />
                    }
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {systemLog: {eventLogs, auditLogs}}} = state;
    return {language, eventLogs, auditLogs};
};

export default connect(mapStateToProps)(SystemLog);