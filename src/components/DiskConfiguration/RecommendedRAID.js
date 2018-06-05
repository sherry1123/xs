import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, Popover, notification} from 'antd';
import RAIDImage from '../../images/raid.png';
import lang from '../Language/lang';
import {formatStorageSize} from '../../services/index';

class RecommendedRAID extends Component {
    constructor (props){
        super(props);
        let {recommendedRAID} = this.props;
        let currentServiceNode = {
            ip: Object.keys(recommendedRAID.metadataServerIPs)[0],
            type: 'metadata',
            i: 0
        };
        let currentRAIDConfList = recommendedRAID.metadataServerIPs[currentServiceNode.ip];
        let currentRAIDConf = currentRAIDConfList[0];
        this.state = {
            currentServiceNode,
            currentRAIDConfList,
            currentRAIDConf: Object.assign({}, currentRAIDConf, {i: 0}) // {i: -1, raidLevel: 0, diskList: [], totalSpace: 0, stripeSize: 0, diskType: 'ssd'},
        };
    }

    changeServiceIP (currentServiceNode){
        let currentRAIDConfList = this.props.recommendedRAID[currentServiceNode.type + 'ServerIPs'][currentServiceNode.ip];
        let currentRAIDConf = currentRAIDConfList[0];
        currentRAIDConf['i'] = 0;
        this.setState({currentServiceNode, currentRAIDConfList, currentRAIDConf});
    }

    changeRAIDConf (conf, i){
        if (i !== this.state.currentRAIDConf.i){
            let currentRAIDConf = conf;
            currentRAIDConf['i'] = i;
            this.setState({currentRAIDConf});
        }
    }

    enableCustomRAID (){
        let {enableCustomRAID} = this.props;
        (typeof enableCustomRAID === 'function') && enableCustomRAID();
        notification.warning({
            message: lang('自定义RAID', 'Custom RAID'),
            description: lang(
                '您已开启了自定义RAID，请给所有节点上的元数据和存储服务配置RAID。',
                'You have enabled custom RAID, please configure RAID for all nodes that metadata and storage services run on.'
            )
        });
    }

    render (){
        let {currentServiceNode, currentRAIDConfList, currentRAIDConf} = this.state;
        let serviceRoleMap = {
            metadata: lang('元数据服务', 'Metadata'),
            storage: lang('存储服务', 'Storage'),
            management: lang('管理服务', 'Management'),
        };
        return (
            <section className="fs-recom-raid-conf-wrapper">
                <div className="fs-left-side-wrapper">
                    <div className="fs-raid-list-title">
                        {lang('推荐的RAID配置', 'Recommended RAID')}
                        <span className="fs-raid-custom">
                            <span onClick={this.enableCustomRAID.bind(this)}>{lang('自定义', 'Custom')}</span>
                            <Popover
                                content={lang(
                                    '将允许您自定义所有元数据和存储服务节点的RAID配置。如果您非专业人士，建议您直接使用推荐配置。这是我们针对您的系统给出的在安全、性能和容量利用率等方面的最优方案。',
                                    'Will allow you to custom the RAID configurations for all nodes that metadata and storage services run on. If you are not professional, we suggest you to use the recommended configuration by default. It\'s the optimal scheme we give out consider to security, performance, and capacity usage rate, etc sides based on your system.')
                                }
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-l" />
                            </Popover>
                        </span>
                    </div>
                    {
                        currentRAIDConf.i !== -1 && <div className="fs-raid-service">
                            {serviceRoleMap[currentServiceNode.type]}<span>{currentServiceNode.ip}</span>
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
                                <span className="fs-raid-info-item">RAID {lang('配置信息: ', 'Configuration Info: ')}</span>
                                <span className="fs-raid-info-item">{lang('级别', 'Level')}: RAID {currentRAIDConf.raidLevel}</span>
                                <span className="fs-raid-info-item">{lang('磁盘数量', 'Disk Number')}: {currentRAIDConf.diskList.length}</span>
                                <span className="fs-raid-info-item">{lang('总容量', 'Total Capacity')}: {formatStorageSize(currentRAIDConf.totalSpace)}</span>
                                <span className="fs-raid-info-item">{lang('条带大小', 'Stripe Size')}: {formatStorageSize(currentRAIDConf.stripeSize)}</span>
                            </div>
                        }
                    </div>
                    <div className="fs-raid-disk-wrapper">
                        {
                            currentRAIDConf.i !== -1 && <div className="fs-raid-disk-title">
                                {lang('该RAID预配置所包含的磁盘', 'Disks In This RAID Pre-Configuration')}
                            </div>
                        }
                        {
                            currentRAIDConf.diskList.map((disk, i) => (
                                <div className="fs-raid-disk-item" key={i}>
                                    <Icon type="hdd" /><span>{disk.diskName}</span><span>{formatStorageSize(disk.space)}</span>
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
    const {language, initialize: {recommendedRAID}} = state;
    return {language, recommendedRAID};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(RecommendedRAID);