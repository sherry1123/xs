import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Select} from 'antd';
import lang from '../../components/Language/lang';
import FSLineChart from '../../components/FSLineChart/FSLineChart';
import {formatStorageSize} from '../../services';

class StorageNodes extends Component {
    constructor (props){
        super(props);
        this.state = {
            currentNode: this.props.nodes[0],
        };
    }

    switchNode (nodeID){
        let currentNode = this.props.nodes.filter(node => node.id === nodeID)[0];
        this.setState({currentNode});
        // fetch current node data

    }

    render (){
        let chartProps =  {
            height: 300,
            title: {
                text: lang('存储节点吞吐量', 'Storage Node Throughput')
            },
            label: ['1', '2', '3'],
            series: [{
                name: 'Throughput',
                type: 'line',
                itemStyle: {
                    normal: {
                        color: '#70BF8A',
                    }
                },
                data: [100, 200 , 100]
            }]
        };
        return (
            <section className="fs-page-content fs-node-wrapper">
                <section className="fs-page-item-wrapper title">
                    <h3 className="fs-page-title">{lang('存储节点', 'Metadata Nodes')}</h3>
                </section>
                <section className="fs-node-item-group">
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper fs-node-info-wrapper">
                            <h3 className="fs-page-title item">{lang('基础信息总览', 'Basic Information')}</h3>
                            <section className="fs-page-item-content fs-node-info-content">
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('节点数量：', 'Number Of Nodes: ')}</span>
                                    {this.props.nodes.length || 0}
                                </span>
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('状态：', 'Status of Nodes: ')}</span>
                                    <i className="fs-node-status up" title={lang('正常', 'up')} /> {this.props.nodes.filter(node => node.up).length || 0}
                                    <i className="fs-node-status down" title={lang('异常', 'down')} /> {this.props.nodes.filter(node => !node.up).length || 0}
                                </span>
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('磁盘总容量：', 'Disk Total Capacity: ')}</span>
                                    {formatStorageSize(this.props.diskStatus.totalCapacity)}
                                </span>
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('磁盘已使用容量：', 'Used Capacity: ')}</span>
                                    {formatStorageSize(this.props.diskStatus.usedCapacity)}
                                </span>
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('磁盘剩余容量：', 'Remaining Capacity: ')}</span>
                                    {formatStorageSize(this.props.diskStatus.remainingCapacity)}
                                </span>
                            </section>
                        </section>
                        <section className="fs-page-item-wrapper fs-user-operation-wrapper">
                            <h3 className="fs-page-title item">{lang('用户操作总览', 'User Operation')}</h3>
                            <section className="fs-page-item-content fs-user-operation-content">
                                <FSLineChart option={chartProps} />
                            </section>
                        </section>
                    </div>
                    <div className="fs-node-item">
                        <section className="fs-page-item-wrapper fs-node-info-wrapper">
                            <h3 className="fs-page-title item">{lang(`节点基础信息 ${this.state.currentNode.name}`, 'Basic Information')}</h3>
                            <section className="fs-page-item-content fs-node-info-content">
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('节点：', 'Node: ')}</span>
                                    <Select style={{width: 150}} size="small" value={this.state.currentNode.id} onChange={this.switchNode.bind(this)}>
                                        {
                                            this.props.nodes.map(({name, id, up}) =>
                                                up && <Select.Option key={name} value={id}>
                                                    {name}
                                                </Select.Option>
                                            )
                                        }
                                    </Select>
                                </span>
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('状态：', 'Status: ')}</span>
                                    <i className="fs-node-status up" title={lang('正常', 'up')} />
                                </span>
                            </section>
                        </section>
                        <section className="fs-page-item-wrapper fs-work-request-wrapper">
                            <h3 className="fs-page-title item">{lang(`节点用户操作 ${this.state.currentNode.name}`, 'User Operation')}</h3>
                            <section className="fs-page-item-content fs-work-request-content">
                                <FSLineChart option={chartProps} />
                            </section>
                        </section>
                    </div>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {storageNodes: {overview: {diskStatus, nodes}}}} = state;
    return {language, diskStatus, nodes};
};

export default connect(mapStateToProps)(StorageNodes);