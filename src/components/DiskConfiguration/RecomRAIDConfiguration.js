import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Popover} from 'antd';
import RAIDImage from '../../images/raid.png';
import lang from '../Language/lang';
import {formatStorageSize} from '../../services/index';

class RecomRAIDConfiguration extends Component {
    constructor (props){
        super(props);
        this.state = {
            currentServiceIP: {},
            currentRAIDConfList: [],
            currentRAIDConf: {i: -1, raidLevel: 0, diskList: [], totalSpace: 0, stripeSize: 0, diskType: 'ssd'},
        };
    }

    changeServiceIP (currentServiceIP){
        let currentRAIDConfList = this.props.RAIDConfig[currentServiceIP.type][currentServiceIP.ip];
        let currentRAIDConf = currentRAIDConfList[0];
        currentRAIDConf['i'] = 0;
        this.setState({currentServiceIP, currentRAIDConfList, currentRAIDConf});
    }

    changeRAIDConf (conf, i){
        if (i !== this.state.currentRAIDConf.i){
            let currentRAIDConf = conf;
            currentRAIDConf['i'] = i;
            this.setState({currentRAIDConf});
        }
    }

    enabledCustomRAID (){
        console.info(123);
    }

    render (){
        let {currentServiceIP, currentRAIDConfList, currentRAIDConf} = this.state;
        let serviceTypeMap = {
            metadataServerIPs: lang('元数据服务', 'Metadata'),
            storageServerIPs: lang('存储服务', 'Storage'),
            managementServerIPs: lang('管理服务', 'Management'),
        };
        return (
            <section className="fs-recom-raid-conf-wrapper">
                <div className="fs-left-side-wrapper">
                    <div className="fs-raid-list-title">
                        {lang('推荐RAID配置', 'Recommended RAID')}
                        <span className="fs-raid-custom">
                            <span onClick={this.enabledCustomRAID.bind(this)}>{lang('自定义', 'Custom')}</span>
                            <Popover
                                content={lang(
                                    '将允许您自定义所有元数据和存储服务节点的RAID配置。建议您直接使用推荐配置，这是我们针对您系统的配置给出的在安全、性能和容量利用率等方面的最优方案。',
                                    'Will allow you to custom the RAID configurations for all nodes that metadata and storage services run on. We suggest you to use the recommended configuration by default, for it\' the optimal plan we give out on security, performance, and capacity usage rate sides based on your system.')
                                }
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-l" />
                            </Popover>
                        </span>
                    </div>
                    {
                        currentRAIDConf.i !== -1 && <div className="fs-raid-service">
                            {serviceTypeMap[currentServiceIP.type]}<span>{currentServiceIP.ip}</span>
                        </div>
                    }
                    <div className="fs-raid-conf-list-wrapper">
                        {
                            currentRAIDConfList.map((conf, i) => (
                                <div
                                    className={`fs-raid-conf-item ${currentRAIDConf.i === i ? 'active' : ''}`}
                                    onClick={() => this.changeRAIDConf.bind(this)(conf, i)}
                                    key={i}
                                >
                                    <img src={RAIDImage} alt="raid-conf-img" />
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="fs-right-side-wrapper">
                    <div className="fs-raid-info-wrapper">
                        {
                            currentRAIDConf.i !== -1 && <div>
                                <span>{lang('RAID级别', 'RAID Level')}: RAID {currentRAIDConf.raidLevel}</span>
                                <span>{lang('阵列磁盘数量', 'Array Disk Number')}: {currentRAIDConf.diskList.length}</span>
                                <span>{lang('阵列总容量', 'Array Total Capacity')}: {formatStorageSize(currentRAIDConf.totalSpace)}</span>
                                <span>{lang('条带大小', 'Stripe Size')}: {formatStorageSize(currentRAIDConf.stripeSize)}</span>
                            </div>
                        }
                    </div>
                    <div className="fs-raid-disk-wrapper">
                        {
                            currentRAIDConf.i !== -1 && <div className="fs-raid-disk-title">{lang('该RAID配置选择的磁盘', 'Disks In This Redundant Array')}</div>
                        }
                        {
                            currentRAIDConf.diskList.map((disk, i) => (
                                <div className="fs-raid-disk-item" key={i}>
                                    <Icon type="hdd" /><span>{disk.path}</span><span>{formatStorageSize(disk.space)}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </section>
        );
    }
}
const mapStateToProps = state => {
    const {language, initialize: {RAIDConfig}} = state;
    return {language, RAIDConfig};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(RecomRAIDConfiguration);