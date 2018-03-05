import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Select} from 'antd';
import lang from '../../components/Language/lang';

class MetadataNodes extends Component {
    constructor (props){
        super(props);
        this.state = {
            currentNode: this.props.metadataNodes[0],
        };
    }

    switchNode (nodeID){
        let currentNode = this.props.metadataNodes.filter(node => node.id === nodeID)[0];
        this.setState({currentNode});
        // fetch current node data

    }

    render (){
        return (
            <section className="fs-page-content fs-metadata-node-wrapper">
                <section className="fs-page-item-wrapper title">
                    <h3 className="fs-page-title">{lang('元数据节点', 'Metadata Nodes')}</h3>
                </section>
                <section className="fs-page-item-group">
                    <div className="fs-metadata-node-overview-item">
                        <section className="fs-page-item-wrapper fs-metadata-node-info-wrapper">
                            <h3 className="fs-page-title item">{lang('基础信息总览', 'Basic Information')}</h3>
                            <section className="fs-page-item-content fs-metadata-node-info-content">
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('节点数量：', 'Number Of Nodes: ')}</span>
                                    {this.props.metadataNodes.length || 0}
                                </span>
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('状态：', 'Status of Nodes: ')}</span>
                                    <i className="fs-node-status up" title={lang('正常', 'up')} /> {this.props.metadataNodes.filter(node => node.up).length || 0}
                                    <i className="fs-node-status down" title={lang('异常', 'down')} /> {this.props.metadataNodes.filter(node => !node.up).length || 0}
                                </span>
                            </section>
                        </section>
                        <section className="fs-page-item-wrapper fs-metadata-user-operation-wrapper">
                            <h3 className="fs-page-title item">{lang('用户操作总览', 'User Operation')}</h3>
                            <section className="fs-page-item-content fs-user-operation-content">
                                这里展示类似于客户端统计中的用户操作的记录，而非工作请求
                            </section>
                        </section>
                    </div>
                    <div className="fs-metadata-node-detail-item">
                        <section className="fs-page-item-wrapper fs-metadata-node-info-wrapper">
                            <h3 className="fs-page-title item">{lang(`${this.state.currentNode.name} 节点基础信息`, 'Basic Information')}</h3>
                            <section className="fs-page-item-content fs-metadata-node-info-content">
                                <span className="fs-info-item">
                                    <span className="fs-info-label">{lang('节点：', 'Node: ')}</span>
                                    <Select style={{width: 150}} size="small" value={this.state.currentNode.id} onChange={this.switchNode.bind(this)}>
                                        {
                                            this.props.metadataNodes.map(({name, id, up}) =>
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
                        <section className="fs-page-item-wrapper fs-metadata-work-request-wrapper">
                            <h3 className="fs-page-title item">{lang(`${this.state.currentNode.name} 节点用户操作`, 'User Operation')}</h3>
                            <section className="fs-page-item-content fs-metadata-work-request-content">
                                这里展示类似于客户端统计中的用户操作的记录，而非工作请求
                            </section>
                        </section>
                    </div>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {metadataNodes: {overview: {metadataNodes}}}} = state;
    return {language, metadataNodes};
};

export default connect(mapStateToProps)(MetadataNodes);