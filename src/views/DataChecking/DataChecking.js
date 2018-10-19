import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, Icon, Progress, message} from "antd";
import DataCheckingHistory from './DataCheckingHistory';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    const {language, main: {dataChecking: {dataCheckingStatus, dataRecoveryStatus}}} = state;
    return {language, dataCheckingStatus, dataRecoveryStatus};
};

@connect(mapStateToProps)
export default class DataChecking extends Component {
    constructor (props){
        super(props);
        this.state = {
            step: 0, // 0-5
            // progress status for checking or recovery(step 1 or 3) common using
            statusNum: 0,
            progressStep: 0,
            progress: 0,
            infoList: [],
            // report of checking or recovery(step 1 or 3)
            report: [],
            reportItemMap: {},
        };
    }

    async componentWillReceiveProps (nextProps){
        let {dataCheckingStatus, dataRecoveryStatus} = nextProps;
        let {step, progressStep, infoList} = this.state;
        // on data checking/recovery step
        if (step === 1 || step === 3){
            let {current, status, total} = step === 1 ? dataCheckingStatus : dataRecoveryStatus;
            infoList= [...infoList];
            if (status === 0){
                // data checking/recovery is working properly
                let progress = (current / total).toFixed(2) * 100;
                if (current > progressStep){
                    infoList.unshift({step: current, progress});
                }
                this.setState({
                    statusNum: status,
                    progressStep: current,
                    progress,
                    infoList
                });
                if (current === total){
                    // data checking/recovery is completed, jump to next step
                    // get operations result
                    let {report, reportItemMap} = await httpRequests.getDataCheckingOrRecoveryReport();
                    step = step + 1;
                    setTimeout(() => {
                        this.setState({
                            step,
                            // clear progress status
                            statusNum: 0,
                            progressStep: 0,
                            progress: 0,
                            infoList: [],
                            report,
                            reportItemMap
                        });
                    }, 3000);
                }
            } else {
                // data checking/recovery is failed, jump to next step advance
                // get operations result
                let {report, reportItemMap} = await httpRequests.getDataCheckingOrRecoveryReport();
                infoList.unshift({step: -1, progress: 100});
                step = step + 1;
                setTimeout(() => {
                    this.setState({
                        step,
                        statusNum: status,
                        progressStep: total, // current,
                        progress: 100,
                        infoList,
                        report,
                        reportItemMap
                    });
                }, 1000);
            }
        }
    }

    async nextStep (){
        try {
            let {step} = this.state;
            step += 1;
            if (step === 1){
                await httpRequests.checkData();
            }
            if (step === 3){
                await httpRequests.recoverData();
            }
            this.setState({
                step,
                statusNum: 0,
                progressStep: 0,
                progress: 0,
                infoList: [{step: 0, progress: 0}],
                report: [],
                reportItemMap: {}
            });
        } catch (e){
            message.warning(lang('集群异常或者已有其他用户在管理平台开始了该操作', 'The cluster is abnormal some others users have already started the operation. '));
        }
    }

    completed (){
        // back to step 0, and clear progress status
         this.setState({
            step: 0,
            statusNum: 0,
            progressStep: 0,
            progress: 0,
            infoList: [],
        });
    }

    showHistory (){
        this.dataCheckingHistoryWrapper.getWrappedInstance().show();
    }

    render (){
        let {step, statusNum, progress, infoList, report, reportItemMap} = this.state;
        let isChinese = this.props.language === 'chinese';
        let progressTipsMap = {
            '-1': lang('数据检查发现错误！', 'Data checking finds some error!'),
            0: lang('数据检查已开始，请稍候', 'Data checking is started, please wait for a moment'),
            1: lang('正在检查节点的可达性', 'Checking reachability of nodes'),
            2: lang('正在删除处置中未使用的文件', 'Deleting unused files from disposal'),
            3: lang('正在从节点中收集数据', 'Gathering data from nodes'),
            4: lang('正在检查错误', 'Checking for errors'),
            5: lang(`${step === 1 ? '检查' : '修复'}文件系统完成，正在生成报告`, `${step === 1 ? 'Check' : 'Recover'} completed, generating report`),
        };
        return (
            <div className="fs-page-content fs-data-checking-wrapper">
                <div className="fs-table-operation-wrapper">
                    <Icon type="security-scan" />
                    <span style={{paddingLeft: 10}}>
                        {lang('数据检查', 'Data Checking')}
                    </span>
                    <div className="fs-table-operation-button-box">
                        {
                            step === 0 && <Button
                                type="primary"
                                size="small"
                                onClick={this.showHistory.bind(this)}
                            >
                                {lang('历史记录', 'History Records')}
                            </Button>
                        }
                        {
                            step === 0 && <Button
                                type="primary"
                                size="small"
                                onClick={this.nextStep.bind(this)}
                            >
                                {lang('开始检查', 'Start Checking')}
                            </Button>
                        }
                        {
                            step === 2 && statusNum === -1 && <Button
                                type="primary"
                                size="small"
                                onClick={this.nextStep.bind(this)}
                            >
                                {lang('下一步', 'Next Step')}
                            </Button>
                        }
                        {
                            step === 2 && statusNum === 0 && <Button
                                type="primary"
                                size="small"
                                onClick={this.completed.bind(this)}
                            >
                                {lang('完成', 'Completed')}
                            </Button>
                        }
                        {
                            // don't need to judge statusNum here, because if the recovery task is failed,
                            // there is no ability to fix it on UI side, the only way to solve this problem
                            // is to contact the operation and maintenance personnel for help.
                            step === 4 && <Button
                                type="primary"
                                size="small"
                                onClick={this.completed.bind(this)}
                            >
                                {lang('完成', 'Completed')}
                            </Button>
                        }
                    </div>
                </div>
                <div className="fs-main-content-wrapper">
                    {
                        step === 0 && <div className="fs-data-checking-step-wrapper description">
                            <div>在这里您可以进行数据检查和修复，请按照以下流程完成相关操作:</div>
                            <div>第一步：点击开始检查数据启动数据检查流程，找出需要修复的数据。</div>
                            <div>第二步：展示数据检查结果，如果有数据需要修复，可以点击下一步，开始数据修复。</div>
                            <div>第三步：进行数据修复，展示数据修复进度信息。</div>
                            <div>第四步：完成数据修复，展示数据修复结果。</div>
                        </div>
                    }
                    {
                        step === 1 && <div className="fs-data-checking-step-wrapper">
                            <div className="fs-progress-gear-wrapper">
                                <i className={`fs-gear-big ${statusNum !== -1 ? 'running' : ''}`} />
                                <i className={`fs-gear-small ${statusNum !== -1 ? 'running' : ''}`}/>
                            </div>
                            <Progress
                                className="fs-progress-bar"
                                showInfo={false}
                                percent={progress}
                                status={statusNum === 0 ? (progress === 100 ? 'success' : 'active') : 'exception'}
                                strokeWidth={15}
                            />
                            <section className="fs-data-checking-progress-wrapper">
                                <div className="fs-data-checking-progress-title">
                                    {lang('数据检查进度信息', 'Data checking Progress Information')}
                                </div>
                                {
                                    (infoList || []).map((info, i) => info.step === -1 ?
                                        <div className="fs-data-checking-progress-info-item failed" key={i}>
                                            {progressTipsMap[-1]}
                                        </div> :
                                        <div className="fs-data-checking-progress-info-item" key={i}>
                                            <span>{lang('完成百分比：', 'Completion Percentage: ') + info.progress + '%'}</span>
                                            <span>{lang('当前阶段： ', 'Current Phase: ') + progressTipsMap[info.step]}</span>
                                        </div>
                                    )
                                }
                            </section>
                        </div>
                    }
                    {
                        step === 2 && <div className="fs-data-checking-step-wrapper">
                            <div className="fs-data-checking-report-content-wrapper">
                                <div className="fs-data-checking-report-content-result">
                                    {lang('检查结论：', 'Checking Result: ')}
                                    {
                                        statusNum === 0 ?
                                            lang(' 数据检查未发现任何错误，请点击完成按钮。', ' None error found during data checking，please click the completed button.') :
                                            lang(' 数据检查发现错误，请点击下一步进行数据修复。', ' Error(s) found during data checking, please click next step button to start data recovery.')
                                    }
                                </div>
                                <div className="fs-data-checking-report-content-title">
                                    {lang('检查项详细报告：', 'Checking Items Detailed Report: ')}
                                </div>
                                {
                                    report.map((item, i) => <span className="fs-data-checking-report-item" key={i}>
                                        {isChinese ? reportItemMap[item.item] : item.item}:
                                        {
                                            item.result === true ?
                                                <span className="fs-data-checking-report-item-result">
                                                    <Icon type="check" className="fs-green" />
                                                    {lang('未发现', 'Not Found')}
                                                </span> :
                                                <span className="fs-data-checking-report-item-result error">
                                                    {item.result}
                                                </span>
                                        }
                                    </span>)
                                }
                            </div>
                        </div>
                    }
                    {
                        step === 3 && <div className="fs-data-checking-step-wrapper">
                            <div className="fs-progress-gear-wrapper">
                                <i className={`fs-gear-big ${statusNum !== -1 ? 'running' : ''}`} />
                                <i className={`fs-gear-small ${statusNum !== -1 ? 'running' : ''}`}/>
                            </div>
                            <Progress
                                className="fs-progress-bar"
                                showInfo={false}
                                percent={progress}
                                status={statusNum === 0 ? (progress === 100 ? 'success' : 'active') : 'exception'}
                                strokeWidth={15}
                            />
                            <section className="fs-data-checking-progress-wrapper">
                                <div className="fs-data-checking-progress-title">
                                    {lang('数据修复进度信息', 'Data Recovery Progress Information')}
                                </div>
                                {
                                    (infoList || []).map((info, i) => info.step === -1 ?
                                        <div className="fs-data-checking-progress-info-item failed" key={i}>
                                            {progressTipsMap[-1]}
                                        </div> :
                                        <div className="fs-data-checking-progress-info-item" key={i}>
                                            <span>{lang('完成百分比：', 'Completion Percentage: ') + info.progress + '%'}</span>
                                            <span>{lang('当前阶段: ', 'Current Phase: ') + progressTipsMap[info.step]}</span>
                                        </div>)
                                }
                            </section>
                        </div>
                    }
                    {
                        step === 4 && <div className="fs-data-checking-step-wrapper">
                            <div className="fs-data-checking-report-content-wrapper">
                                <div className="fs-data-checking-report-content-result">
                                    {lang('修复结论：', 'Recovery Result: ')}
                                    {
                                        statusNum === 0 ?
                                            lang(' 数据修复过程中未出现错误，数据已成功修复，请点击完成按钮。', ' None error found during data recovery，data is recovered successfully, please click the completed button.') :
                                            lang(' 数据修复过程中出现错误，请联系运维人员寻求帮助。', ' Error(s) found during data checking, please contact the operation and maintenance personnel for help.')
                                    }
                                </div>
                                <div className="fs-data-checking-report-content-title">
                                    {lang('修复项详细报告：', 'Recovery Items Detailed Report: ')}
                                </div>
                                {
                                    report.map((item, i) => <span className="fs-data-checking-report-item" key={i}>
                                        {isChinese ? reportItemMap[item.item] : item.item}:
                                        {
                                            item.result === true ?
                                                <span className="fs-data-checking-report-item-result">
                                                    <Icon type="check" className="fs-green" />
                                                    {lang('无错误', 'No Error Found')}
                                                </span> :
                                                <span className="fs-data-checking-report-item-result error">
                                                    {item.result}
                                                </span>
                                        }
                                    </span>)
                                }
                            </div>
                        </div>
                    }
                </div>
                <DataCheckingHistory ref={ref => this.dataCheckingHistoryWrapper = ref} />
            </div>
        );
    }
}