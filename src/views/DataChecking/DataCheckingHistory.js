import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, DatePicker, Icon, Modal, Popover, Table} from 'antd';
import {formatTime} from 'Services';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    let {language, main: {dataChecking: {dataCheckingAndRecoveryHistory}}} = state;
    return {language, dataCheckingAndRecoveryHistory};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
export default class DataCheckingHistory extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            queryTimeStart: '',
            queryTimeEnd: '',
            dataCheckingAndRecoveryHistory: [],
            dataCheckingAndRecoveryHistoryBackup: [],
        };
    }

    async componentWillReceiveProps (nextProps){
        let {dataCheckingAndRecoveryHistory} = nextProps;
        await this.setState({
            dataCheckingAndRecoveryHistory,
            dataCheckingAndRecoveryHistoryBackup: dataCheckingAndRecoveryHistory
        });
        let {queryTimeStart, queryTimeEnd} = this.state;
        await this.searchInTable(queryTimeStart, queryTimeEnd, true);
    }

    queryChange (dates, dataStrings){
        let [queryTimeStart, queryTimeEnd] = dataStrings;
        queryTimeStart = !queryTimeStart ? queryTimeStart : queryTimeStart + 'T00:00:00';
        queryTimeEnd = !queryTimeEnd ? queryTimeEnd : queryTimeEnd + 'T23:59:59';
        this.searchInTable(queryTimeStart, queryTimeEnd);
    }

    async searchInTable (queryTimeStart, queryTimeEnd, dataRefresh){
        if (queryTimeStart || queryTimeEnd || dataRefresh){
            await this.setState({
                queryTimeStart,
                queryTimeEnd,
                dataCheckingAndRecoveryHistory: [...this.state.dataCheckingAndRecoveryHistoryBackup].filter(({startTime, endTime}) => {
                    let inTheRangeOfQueryTime = false;
                    if (queryTimeStart){
                        if (queryTimeEnd){
                            inTheRangeOfQueryTime = startTime > queryTimeStart && endTime < queryTimeEnd;
                        } else {
                            inTheRangeOfQueryTime = startTime > queryTimeStart;
                        }
                    } else {
                        inTheRangeOfQueryTime = true;
                    }
                    return inTheRangeOfQueryTime;
                })
            });
        } else {
            this.setState({dataCheckingAndRecoveryHistory: this.state.dataCheckingAndRecoveryHistoryBackup});
        }
    }

    async show (path){
        await this.setState({
            visible: true,
            path,
            query: '',
            dataCheckingAndRecoveryHistory: [],
            dataCheckingAndRecoveryHistoryBackup: [],
        });
        await httpRequests.getDataCheckingAndRecoveryHistory();
    }

    hide (){
        this.setState({
            visible: false
        });
    }

    render (){
        let {dataCheckingAndRecoveryHistory} = this.state;
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let typeMap = {
            checking: lang('数据检查', 'Data Checking'),
            recovery: lang('数据修复', 'Data Recovery')
        };
        let tableProps = {
            size: 'small',
            dataSource: dataCheckingAndRecoveryHistory,
            pagination: dataCheckingAndRecoveryHistory.length > 5 &&{
                size: 'normal',
                pageSize: 5,
                showTotal: (total, range) => lang(`显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`, `show ${range[0]}-${range[1]} of ${total} items`),
            },
            rowKey: 'startTime',
            locale: {
                emptyText: lang('暂无历史记录', 'No history record')
            },
            title: () => (
                <div>
                    <DatePicker.RangePicker
                        size="small"
                        onChange={this.queryChange.bind(this)}
                    />
                </div>
            ),
            columns: [
                {title: lang('类型', 'Type'), width: 70, dataIndex: 'type',
                    render: text => typeMap[text]
                },
                {title: lang('结果', 'Result'), width: 70, dataIndex: 'result',
                    render: text => text === 'uncompleted' ?
                        <span>
                            {lang('未完成', 'Uncompleted')}
                            <Popover
                                {...buttonPopoverConf}
                                content={lang('任务正在进行中或中途因失败而未能完成。如果任务失败，请联系运维人员寻求帮助。', 'The task is uncompleted or fails due to failure. If the task fails, please contact the operation and maintenance personnel for help.')}
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-l" />
                            </Popover>
                        </span> :
                        text === true ?
                            <span className='fs-green'>{lang('未发现错误', 'Error Not Found')}</span> :
                            <span className='fs-red'>{lang('发现错误', 'Error Found')}</span>
                },
                {title: lang('开始时间', 'Start Time'), width: 70, dataIndex: 'startTime',
                    render: text => formatTime(text)
                },
                {title: lang('完成时间', 'Completed Time'), width: 70, dataIndex: 'endTime',
                    render: text => formatTime(text)
                },
            ],
        };
        return (
            <Modal
                title={lang('数据检查与修复历史记录', 'Data Checking And Recovery History Records')}
                width={600}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                    </div>
                }
            >
                <Table {...tableProps} />
            </Modal>
        );
    }
}