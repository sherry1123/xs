import React, {Component} from 'react';
import {connect} from "react-redux";
import ClusterInformation from './ClusterInformation';
import ThroughputStatistics from './ThroughputStatistics';
import IOPSStatistics from './IOPSStatistics';
import TargetRanking from './TargetRanking';

class Dashboard extends Component {
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
           </div>
        );
    }
}

const mapStateToProps = state => {
    const {language,} = state;
    return {language,};
};

export default connect(mapStateToProps)(Dashboard);