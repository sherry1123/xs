import React, { Component } from 'react';
import { connect } from 'react-redux';
import lang from '../../components/Language/lang';
import ClusterMonitor from './ClusterMonitor';//集群监视器
import CpacityUsage from './CpacityUsage';//容量使用
import DiskStatus from './DiskStatus';//硬盘状态
import EventMonitor from './EventMonitor';//事件监视器
import IOPSRanking from './IOPSRanking';//IOPSRanking 写入读出排行

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillUnmount() {

  }

  render() {
    return (
      <section className="fs-page-content fs-dashboard-wrapper">
        <section className="fs-cluster-monitor-wrapper">
          {/* <h3 className="fs-page-title item">{lang('集群监控', 'Cluster Monitor')}</h3> */}
          <section className="fs-page-item-content  fs-cluster-monitor-content">
            <div className="fs-cluster-monitor-detail-A">
              <ClusterMonitor />
            </div>
            <div className="fs-cluster-monitor-detail-B">
              <ClusterMonitor />
            </div>
          </section>
        </section>

        <section className=" fs-cluster-monitor-CpacityUsage">
          <h3 className="fs-page-title item">{lang(' ', '')}</h3>
          <section className="fs-page-item-content fs-CpacityUsage-content">
            <div className="fs-CpacityUsage-content-detail-A">
              <CpacityUsage />
            </div>
            <div className="fs-CpacityUsage-content-detail-B">
              数据状态
                        </div>
            <div className="fs-CpacityUsage-content-detail-C">
              {/* <div></div> */}
              <DiskStatus />
            </div>
          </section>
        </section>
        <section className="fs-EventMonitor-wrapper">
          <h3 className="fs-page-title item">{lang(' ', '')}</h3>

          <section className="fs-page-item-content fs-EventMonitor-content">
            <div className="fs-EventMonitor-content-detail-A">
              <EventMonitor />
            </div>
            <div className="fs-EventMonitor-content-detail-B">
              IOPS 排行位置
                        </div>
          </section>
        </section>
      </section>
    )
  }
}

const mapStateToProps = state => {
  const { language } = state;
  return { language };
};

export default connect(mapStateToProps)(Dashboard);