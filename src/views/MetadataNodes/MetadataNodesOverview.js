import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from '../../components/Language/lang';
import OChart from '../../components/OChart';

class MetadataNodesOverview extends Component {
    render (){
        return (
            <section className="fs-page-content fs-metadata-node-overview-wrapper">
                <section className="fs-metadata-node-basic-info-wrapper">
                    <section className="fs-page-title-wrapper">
                        <h3>{lang('元数据节点基础信息', 'Metadata Nodes Basic Information')}</h3>
                    </section>
                    <section className="fs-metadata-node-basic-info-content">
                        <span className="fs-info-item">
                            <span className="fs-info-label">{lang('节点数量：', 'Node Number:')}</span>
                            5
                        </span>
                        <span className="fs-info-item">
                            <span className="fs-info-label">{lang('状态：', 'Status: ')}</span>
                            <i className="fs-node-status up" title={lang('正常', 'up')} /> 4
                            <i className="fs-node-status down" title={lang('异常', 'error')} /> 1
                        </span>
                    </section>
                </section>
                <section className="fs-metadata-work-request-wrapper">
                    <section className="fs-page-title-wrapper">
                        <h3>{lang('工作请求', 'Work Request')}</h3>
                    </section>
                    <section className="fs-metadata-work-request-content">
                        <OChart />
                    </section>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

export default connect(mapStateToProps)(MetadataNodesOverview);