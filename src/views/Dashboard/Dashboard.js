import React, { Component } from 'react';
import { connect } from 'react-redux';
import lang from '../../components/Language/lang';
import ClusterMonitor from './ClusterMonitor';//集群监视器
import CpacityUsage from './CpacityUsage';//容量使用
import DiskStatus from './DiskStatus';//硬盘状态
import EventMonitor from './EventMonitor';//事件监视器
import IOPSRanking from './IOPSRanking';//IOPSRanking 写入读出排行

import config from './chart.config.js'
import FSLineChart from '../../components/FSLineChart/FSLineChart';
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    // console.log(this.props)
  }
  componentWillUnmount() {
    
  }

  render() {
    return (
      <section className="fs-page-content fs-dashboard-wrapper">
        <section className="fs-cluster-monitor-wrapper">
          <section className="fs-page-item-wrapper ">
            <h3 className="fs-page-title ">{lang('集群监控', 'Cluster Monitor')}</h3>
          </section>
          <section className="fs-page-item-content  fs-cluster-monitor-content">
            <div className="fs-cluster-monitor-detail-A">
              <section className="fs-title-block">
                <span className="fs-info-item">
                  <span className="fs-info-label">{lang('带宽：', 'BandWidth: ')}</span>
                    <span><i className="fs-node-status-circle up" title={lang('正常', 'Up')} />  {lang('读带宽：', 'getBandWidth: ')} 18%  </span>
                    <span><i className="fs-node-status-circle blue" title={lang('正常', 'blue')} />  {lang('写带宽：', ' writeBandWidth: ')} 18%  </span>
                    <span><i className="fs-node-status-circle down" title={lang('正常', 'down')} />  {lang('恢复带宽：', 'restoreBandWidth: ')} 18%  </span>
                  </span>
              </section>
              <FSLineChart option={config.chartProps2} />
            </div>
            <div className="fs-cluster-monitor-detail-B">
            <section className="fs-title-block">
                <span className="fs-info-item">
                  <span className="fs-info-label">{lang('IO：', 'IO: ')}</span>
                    <span><i className="fs-node-status-circle up" title={lang('读延迟', 'Up')} />  {lang('读延迟：', 'Readdelay: ')} 60us  </span>
                    <span><i className="fs-node-status-circle blue" title={lang('写延迟', 'blue')} />  {lang('写延迟：', 'Writedelay: ')} 30mu  </span>
                  {/* <br/> */}
                  {/* <span className="fs-info-label">{lang('IO：', 'IO: ')}</span>
                    <span><i className="fs-node-status-circle up" title={lang('正常', 'Up')} />  {lang('读带宽：', 'getBandWidth: ')} 18%  </span>
                    <span><i className="fs-node-status-circle blue" title={lang('正常', 'blue')} />  {lang('写带宽：', ' writeBandWidth: ')} 18%  </span>
                    <span><i className="fs-node-status-circle down" title={lang('正常', 'down')} />  {lang('恢复Í带宽：', 'restoreBandWidth: ')} 18%  </span> */}
                </span>
              </section>
              <FSLineChart option={config.chartProps1} />
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
            <DiskStatus />
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
  // console.log(state)
let sa='sss';
  const { language } = state;
  // console.log('state')
  // console.log(state)
  return { language,sa };
};

export default connect(mapStateToProps)(Dashboard);