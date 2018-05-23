import React, {Component} from 'react';
import ClusterInformation from './ClusterInformation';
import ThroughputStatistics from './ThroughputStatistics';
import IOPSStatistics from './IOPSStatistics';
import TargetRanking from './TargetRanking';
import PhysicalNodeList from './PhysicalNodeList';
import httpRequests from '../../http/requests';

export default class Dashboard extends Component {
    componentDidMount (){
        httpRequests.getClusterInfo();
        httpRequests.getClusterTargets();
        httpRequests.getClusterThroughput();
        httpRequests.getClusterIOPS();
        httpRequests.getClusterPhysicalNodeList();
    }

    render (){
        return (
           <div className="fs-page-content fs-dashboard-wrapper">
               <div className="fs-dashboard-row">
                    <ClusterInformation />
                    <TargetRanking />
               </div>
               <div className="fs-dashboard-row">
                   <ThroughputStatistics />
                   <IOPSStatistics />
               </div>
               <div className="fs-dashboard-row">
                   <PhysicalNodeList />
               </div>
           </div>
        );
    }
}