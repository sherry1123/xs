import React, {Component} from 'react';
import {connect} from "react-redux";
import {Icon} from 'antd';
import FSPieChart from '../../components/FSPieChart/FSPieChart';
import ClusterImage from '../../images/cluster.png';
import lang from "../../components/Language/lang";

class ClusterInformation extends Component {

    render (){
        let chartOption = {
            width: 130,
            height: 130,
            tooltip : {
                trigger: 'item',
                formatter: '{b}: {d}%'
            },
            formatter: `${lang('使用率', 'Usage Rate')} \n\n ${20}%`,
            series: [{
                name: lang('集群容量状态', 'Cluster Capacity Status'),
                type: 'pie',
                color: ['#f8ad01', '#b5df79'],
                legend: {
                    data: [lang('已使用容量', 'Used Disk Capacity'), lang('可用容量', 'Available Disk Capacity')]
                },
                data: [
                    {value: 2000000000000, name: lang('已使用容量', 'Used Disk Capacity')},
                    {value: 8000000000000, name: lang('可用容量', 'Available Disk Capacity')},
                ]
            }],
        };

        return (
            <div className="fs-cluster-information-wrapper">
                <header><Icon type="folder" /> {lang('集群基本信息', 'Cluster Basic Information')}</header>
                <div className="fs-cluster-information-content">
                    <div className="fs-cluster-status-row">
                        {lang('正常', 'Normal')} <i className="fs-status-circle up" />
                    </div>
                    <div className="fs-cluster-info-row">
                        <div className="fs-cluster-machine-image-wrapper">
                            <img alt={lang('集群', 'Cluster')} src={ClusterImage} />
                        </div>
                        <div className="fs-cluster-node-information-wrapper">
                            <header>{lang('集群节点信息', 'Cluster Node Info.')}</header>
                            <div className="fs-cluster-info-item">
                                {lang('节点总数:', 'Total Nodes:')}
                                <span className="fs-cluster-info-value">
                                    11 <span className="fs-cluster-info-unit">{lang('个', ' ')}</span>
                                </span>
                            </div>
                            <div className="fs-cluster-info-item">
                                {lang('正常节点:', 'Normal Nodes:')}
                                <span className="fs-cluster-info-value">
                                    <span className="fs-normal-node-value">10</span> <span className="fs-cluster-info-unit">{lang('个', ' ')}</span>
                                </span>
                            </div>
                            <div className="fs-cluster-info-item">
                                {lang('异常节点:', 'Abnormal Nodes:')}
                                <span className="fs-cluster-info-value">
                                    <span className="fs-error-node-value">1</span> <span className="fs-cluster-info-unit">{lang('个', ' ')}</span>
                                </span>
                            </div>
                        </div>
                        <div className="fs-cluster-storage-wrapper">
                            <header>{lang('集群容量信息', 'Cluster Capacity Info.')}</header>
                            <div className="fs-cluster-info-item need-icon total">
                                {lang('总容量:', 'Total Capacity:')}
                                <span className="fs-cluster-info-value">
                                    5 <span className="fs-cluster-info-unit">TB</span>
                                </span>
                            </div>
                            <div className="fs-cluster-info-item need-icon used">
                                {lang('已用容量:', 'Used Capacity:')}
                                <span className="fs-cluster-info-value">
                                    1 <span className="fs-cluster-info-unit">TB</span>
                                </span>
                            </div>
                            <div className="fs-cluster-info-item need-icon free">
                                {lang('可用容量:', 'Free Capacity:')}
                                <span className="fs-cluster-info-value">
                                    4 <span className="fs-cluster-info-unit">TB</span>
                                </span>
                            </div>
                        </div>
                        <div className="fs-cluster-chart-wrapper">
                            <FSPieChart option={chartOption} />
                            <div className="fs-chart-bottom-title">{lang('容量使用状态', 'Capacity Status')}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language,} = state;
    return {language,};
};

export default connect(mapStateToProps)(ClusterInformation);