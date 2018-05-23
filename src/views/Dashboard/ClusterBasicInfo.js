import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import FSPieChart from '../../components/FSPieChart/FSPieChart';
import ClusterImage from '../../images/cluster.png';
import lang from '../../components/Language/lang';
import {formatStorageSize} from '../../services';

class ClusterBasicInfo extends Component {
    formatSizeAndSmallerUnit (size){
        let [value, unit] = formatStorageSize(size).split(' ');
        return <span>{value} <span className="fs-cluster-info-unit">{unit}</span></span>;
    }

    render (){
        let {
            clusterStatus: {total: totalNodes, normal, abnormal, status},
            clusterCapacity: {total, used, free, usage}
        } = this.props;
        let chartOption = {
            width: 130,
            height: 130,
            tooltip : {
                trigger: 'item',
                formatter: '{b}: {d}%'
            },
            formatter: `${lang('使用率', 'Usage Rate')} \n ${usage}`,
            series: [{
                name: lang('集群容量状态', 'Cluster Capacity Status'),
                type: 'pie',
                color: ['#f6b93f', '#b5df79'],
                legend: {
                    data: [lang('已使用容量', 'Used Disk Capacity'), lang('可用容量', 'Available Disk Capacity')]
                },
                data: [
                    {value: used, name: lang('已使用容量', 'Used Disk Capacity')},
                    {value: free, name: lang('可用容量', 'Available Disk Capacity')},
                ]
            }],
        };

        return (
            <div className="fs-cluster-information-wrapper">
                <header><Icon type="bars" />{lang('集群基本信息', 'Cluster Basic Information')}</header>
                <div className="fs-cluster-information-content">
                    <div className="fs-cluster-machine-image-wrapper">
                        <img alt={lang('集群', 'Cluster')} src={ClusterImage} />
                    </div>
                    <div className="fs-cluster-node-information-wrapper">
                        <header>{lang('集群节点信息', 'Node Information')}</header>
                        <div className="fs-cluster-info-item">
                            {lang('集群状态:', 'Status:')}
                            <span className="fs-cluster-info-value">
                                <i className={`fs-status-circle ${status ? 'up' : 'down'}`} />{status ? lang('正常', 'Normal') : lang('异常', 'Abnormal')}
                            </span>
                        </div>
                        <div className="fs-cluster-info-item">
                            {lang('节点总数:', 'Total Nodes:')}
                            <span className="fs-cluster-info-value">
                                {totalNodes} <span className="fs-cluster-info-unit">{lang('个', ' ')}</span>
                            </span>
                        </div>
                        <div className="fs-cluster-info-item">
                            {lang('正常节点数:', 'Normal Nodes:')}
                            <span className="fs-cluster-info-value">
                                <span className="fs-normal-node-value">{normal}</span> <span className="fs-cluster-info-unit">{lang('个', ' ')}</span>
                            </span>
                        </div>
                        <div className="fs-cluster-info-item">
                            {lang('异常节点数:', 'Abnormal Nodes:')}
                            <span className="fs-cluster-info-value">
                                <span className="fs-error-node-value">{abnormal}</span> <span className="fs-cluster-info-unit">{lang('个', ' ')}</span>
                            </span>
                        </div>
                    </div>
                    <div className="fs-cluster-storage-wrapper">
                        <header>{lang('集群容量信息', 'Capacity')}</header>
                        <div className="fs-cluster-info-item need-icon total">
                            {lang('总容量:', 'Total:')}
                            <span className="fs-cluster-info-value">
                                {this.formatSizeAndSmallerUnit(total)}
                            </span>
                        </div>
                        <div className="fs-cluster-info-item need-icon used">
                            {lang('已用容量:', 'Used:')}
                            <span className="fs-cluster-info-value">
                                {this.formatSizeAndSmallerUnit(used)}
                            </span>
                        </div>
                        <div className="fs-cluster-info-item need-icon free">
                            {lang('可用容量:', 'Free:')}
                            <span className="fs-cluster-info-value">
                                {this.formatSizeAndSmallerUnit(free)}
                            </span>
                        </div>
                    </div>
                    <div className="fs-cluster-chart-wrapper">
                        <FSPieChart option={chartOption} />
                        <div className="fs-chart-bottom-title">{lang('容量使用状态', 'Capacity Status')}</div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterStatus, clusterCapacity}}} = state;
    return {language, clusterStatus, clusterCapacity};
};

export default connect(mapStateToProps)(ClusterBasicInfo);