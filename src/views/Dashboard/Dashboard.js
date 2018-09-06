import React, {Component} from 'react';
import ClusterBasicInfo from './ClusterBasicInfo';
import ClusterTPS from './ClusterTPS';
import ClusterIOPS from './ClusterIOPS';
import ClusterTargetsRanking from './ClusterTargetsRanking';
import ClusterPhysicalNodeList from './ClusterPhysicalNodeList';
import httpRequests from 'Http/requests';

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
                    <ClusterBasicInfo />
                    <ClusterTargetsRanking />
               </div>
               <div className="fs-dashboard-row">
                   <ClusterTPS />
                   <ClusterIOPS />
               </div>
               <div className="fs-dashboard-row">
                   <ClusterPhysicalNodeList />
               </div>
           </div>
        );
    }
}