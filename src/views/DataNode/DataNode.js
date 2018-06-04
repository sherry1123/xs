import React, {Component} from 'react';
import PhysicalNodeInfo from './PhysicalNodeInfo';
import PhysicalNodeCPU from './PhysicalNodeCPU';
import PhysicalNodeDRAM from './PhysicalNodeDRAM';
import PhysicalNodeTPS from './PhysicalNodeTPS';
import PhysicalNodeIOPS from './PhysicalNodeIOPS';
import PhysicalNodeTargetList from './PhysicalNodeTargetList';
import httpRequests from '../../http/requests';

export default class DataNode extends Component {
    componentDidMount (){
        httpRequests.getClusterPhysicalNodeList();
        httpRequests.getPhysicalNodeInfo();
        httpRequests.getPhysicalNodeTargets();
        httpRequests.getPhysicalNodeCPU();
        httpRequests.getPhysicalNodeDRAM();
        httpRequests.getPhysicalNodeTPS();
        httpRequests.getPhysicalNodeIOPS();
    }

    render (){
        return (
            <div className="fs-page-content fs-dashboard-wrapper">
                <PhysicalNodeInfo />
                <div className="fs-dashboard-row">
                    <PhysicalNodeCPU />
                    <PhysicalNodeDRAM />
                </div>
                <div className="fs-dashboard-row">
                    <PhysicalNodeTPS />
                    <PhysicalNodeIOPS />
                </div>
                <div className="fs-dashboard-row">
                    <PhysicalNodeTargetList />
                </div>
            </div>
        );
    }
}