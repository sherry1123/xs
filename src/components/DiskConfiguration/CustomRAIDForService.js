import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Popover, Select, message} from 'antd';
import FSTransfer from '../FSTransfer/FSTransfer';
import RAIDImage from '../../images/raid.png';
import lang from '../Language/lang';
import dashboardAction from '../../redux/actions/dashboardAction';
import httpRequests from '../../http/requests';
import {formatStorageSize} from '../../services/index';

class CustomRAIDForService extends Component {
    constructor (props){
        super(props);
        this.defaultRAIDLevel = {name: 'RAID 5', rule: '3|-1|-1'};
        // node disks group by node ip
        this.nodeDisksMap = {};
        // used node disks group by node ip
        this.usedDiskNamesGroupByNodeIP = {};
        this.state = {
            // RAID level for drop down selection
            // rule example: 'at least disks|at most disks|even or odd disks', '-1' means no need to validate this item
            RAIDLevels: [
                {name: 'RAID 0', rule: '2|-1|-1'},
                {name: 'RAID 1', rule: '2|2|-1'},
                {name: 'RAID 5', rule: '3|-1|-1'},
                {name: 'RAID 6', rule: '4|-1|-1'},
                {name: 'RAID 10', rule: '4|-1|even'}
            ],
            // stripe size for drop down selection
            stripeSize: ['2 KB', '4 KB', '8 KB', '16 KB', '32 KB', '64 KB', '128 KB', '256 KB'],
            // current node contains type and ip
            currentServiceNode: {},
            // current RAID conf in current node's RAID list
            currentRAIDConf: {i: -1, arrayLevel: {}, arrayStripeSize: '', selectedDisks: [],},
            // RAID configuration list of current node
            RAIDList: [],
            // current RAID conf index
            // already selected disks in current RAID
            selectedDisks: [],
            // current RAID level, contains level text and rule
            arrayLevel: {name: 'RAID 5', rule: '3|-1|-1'},
            // current RAID recommended stripe size
            arrayStripeSize: '8 KB',  // default to 8KB
            // current RAID total capacity
            arrayCapacity: 0,
            // if can apply this RAID configuration for the node, must pass the RAID rule validation
            enableApplyButton: true,
        };
    }

    async changeServiceIP (currentServiceNode){
        this.setState({currentServiceNode, RAIDList: []});
    }

    addRAID (){
        let {RAIDList} = this.state;
        RAIDList.push({
            i: RAIDList.length, arrayLevel: this.defaultRAIDLevel, arrayStripeSize: '8 KB', selectedDisks: []
        });
        this.setState({RAIDList});
    }

    async removeRAID (conf, i){
        let {currentServiceNode, RAIDList} = this.state;
        RAIDList = [...RAIDList];
        RAIDList.splice(i, 1);
        await this.setState({RAIDList});
        // reset the used disks record
        this.usedDiskNamesGroupByNodeIP[currentServiceNode.ip] = RAIDList.reduce((prev, curr) => prev.concat(curr.selectedDisks.map(disk => disk)), []);
    }

    async switchRAID (conf, i){
        let {currentServiceNode} = this.state;
        let ip = currentServiceNode.ip;
        try {
            // Switch to this RAID conf only when fetch this node's disk list successfully
            let nodeDisks = await this.getNodeDisksByNodeIP(ip);
            // If some disks on one node are used by metadata service, they can't be used by storage service on the same node,
            // and vice versa. This is aimed at the situation that metadata and storage services are created on one same node
            let usedDisks = this.usedDiskNamesGroupByNodeIP[ip];
            if (usedDisks){
                let usedDiskNames = usedDisks.map(disk => disk.diskName);
                if (!!usedDisks){
                    nodeDisks = nodeDisks.filter(disk => !usedDiskNames.includes(disk.diskName));
                }
            }
            // change the left side disks for FSTransfer
            this.fsTransferWrapper.getWrappedInstance().changeSource(nodeDisks);
            if (!conf.selectedDisks.length){
                // the selected RAID hasn't finished RAID configuration yet
                this.setState({
                    currentRAIDConf: Object.assign({}, conf, {i}), // i is a helpful key for mutating a conf in RAID conf list quickly
                    selectedDisks: [],
                    arrayLevel: this.defaultRAIDLevel,
                    arrayStripeSize: '8 KB',
                    arrayCapacity: 0
                });
            } else {
                // the selected node is configured
                let selectedDisks = conf.selectedDisks;
                // show RAID configuration of this node
                let selectedDisksNames = selectedDisks.map(disk => disk.diskName);
                // remove the disks that are already in selectedDisks
                nodeDisks = nodeDisks.filter(disk => !selectedDisksNames.includes(disk.diskName));
                this.fsTransferWrapper.getWrappedInstance().changeSource(nodeDisks);
                // re-calculate RAID capacity
                let arrayCapacity = this.calculateArrayCapacity(selectedDisks);
                this.setState({
                    currentRAIDConf: Object.assign({}, conf, {i}),
                    selectedDisks,
                    arrayLevel: conf.arrayLevel,
                    arrayStripeSize: conf.arrayStripeSize,
                    arrayCapacity
                });
            }
        } catch (e){
            // fetch disks failed
            message.error(lang(`获取节点 ${ip} 的磁盘失败！`, `Fetch disks of node ${ip} failed!`));
        }
    }

    async getNodeDisksByNodeIP (ip){
        // If it has already fetched this node's disks, and the disks length is not 0, don't fetch them again
        let disksOfThisIP = this.nodeDisksMap[ip];
        if (!disksOfThisIP || !disksOfThisIP.length){
            // not fetch yet, or fetched but get no disk
            let disks = await httpRequests.getNodeDisksByNodeIP(ip);
            this.nodeDisksMap[ip] = disks;
            return  disks;
        } else {
            return this.nodeDisksMap[ip];
        }
    }

    switchRAIDLevel (value, option){
        this.setState({arrayLevel: Object.assign({}, option.props.level)});
    }

    switchStripeSize (value, option){
        this.setState({arrayStripeSize: option.props.size});
    }

    selectedDisksChange (nextTargetItems/*, direction, moveItems*/){
        let arrayCapacity = this.calculateArrayCapacity(nextTargetItems);
        this.setState({selectedDisks: nextTargetItems, arrayCapacity});
    }

    calculateArrayCapacity (disks){
        let arrayCapacity = 0;
        disks.forEach(disk => arrayCapacity += disk.totalSpace);
        return arrayCapacity;
    }

    checkRAID (){
        // check whether selected selectedDisks of this RAID match current RAID level rule or not
        let {arrayLevel: {rule}} = this.state;
        let [min, max, parity] = rule.split('|');
        // console.info(min, max, parity);
        let {selectedDisks} = this.state;
        let diskNumber = selectedDisks.length;
        // validate number at lest of disks
        if (min !== '-1'){
            // console.info(diskNumber, min, diskNumber < min);
             if (diskNumber < min){
                 return false;
             }
        }
        // validate number at most of disks
        if (max !== '-1'){
            // console.info(diskNumber, max, diskNumber > max);
            if (diskNumber > max){
                return false;
            }
        }
        // validate number parity at lest of disks
        if (parity !== '-1'){
            let diskNumberParity = (diskNumber % 2 === 0) ? 'even' : 'odd';
            if (diskNumberParity !== parity){
                return false;
            }
        }
        // validate ok
        return true;
    }

    async applyConfForNode (){
        if (this.checkRAID()){
            let {currentServiceNode, currentRAIDConf, selectedDisks, RAIDList} = this.state;
            currentRAIDConf.selectedDisks = [...selectedDisks];
            currentRAIDConf.arrayLevel = Object.assign({}, this.state.arrayLevel);
            currentRAIDConf.arrayStripeSize = this.state.arrayStripeSize;
            RAIDList = [...RAIDList];
            RAIDList.splice(currentRAIDConf.i, 1, currentRAIDConf);
            await this.setState({RAIDList});
            // reset the used disks record
            this.usedDiskNamesGroupByNodeIP[currentServiceNode.ip] = RAIDList.reduce((prev, curr) => prev.concat(curr.selectedDisks.map(disk => disk)), []);
            message.success(lang('应用RAID配置成功!', 'Apply RAID configuration successfully!'));
            this.props.setCustomRAIDList(RAIDList);
        } else {
            // Give some tips out according to current RAID level rule, and let user to
            // correct selected selectedDisks depend on the requirement of this RAID level.
            let level = this.state.arrayLevel.name;
            message.error(lang(`选择的磁盘不满足 ${level} 的要求，请重新选择！`, `The disks you selected are not match the requirement of ${level}, please correct them!`));
        }
    }

    enableRecommendedRAID (){
        let {enableRecommendedRAID} = this.props;
        (typeof enableRecommendedRAID === 'function') && enableRecommendedRAID();
    }

    clearRAIDConf (){
        this.nodeDisksMap = {};
        this.usedDiskNamesGroupByNodeIP = {};
        this.setState({
            currentServiceNode: {},
            currentRAIDConf: {i: -1, arrayLevel: {}, arrayStripeSize: '', selectedDisks: [],},
            RAIDList: [],
            selectedDisks: [],
            arrayLevel: {name: 'RAID 5', rule: '3|-1|-1'},
            arrayStripeSize: '8 KB',
            arrayCapacity: 0,
            enableApplyButton: true,
        });
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let {
            currentServiceNode = {}, currentRAIDConf = {},
            enableApplyButton, RAIDLevels, arrayLevel, arrayStripeSize, arrayCapacity, stripeSize, RAIDList, selectedDisks,
        } = this.state;
        let serviceRoleMap = {
            metadata: lang('元数据服务', 'Metadata'),
            storage: lang('存储服务', 'Storage'),
            management: lang('管理服务', 'Management'),
        };
        return (
            <section className="fs-recom-raid-conf-wrapper">
                <div className="fs-left-side-wrapper">
                    <div className="fs-raid-list-title">
                        {lang('自定义RAID', 'Custom RAID')}
                        <span className="fs-raid-custom">
                            {
                                currentServiceNode.ip && currentServiceNode.type &&
                                <span onClick={this.enableRecommendedRAID.bind(this)}>{lang('推荐配置', 'Recommended')}</span>
                            }
                            <Popover
                                {...buttonPopoverConf}
                                content={lang(
                                    '使用推荐的RAID配置',
                                    'Use recommended RAID configuration')
                                }
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-l" />
                            </Popover>
                        </span>
                    </div>
                    {
                        currentServiceNode.hasOwnProperty('type') && <div className="fs-raid-service">
                            {serviceRoleMap[currentServiceNode.type]}<span>{currentServiceNode.ip}</span>
                        </div>
                    }
                    <div className="fs-raid-conf-list-wrapper">
                        {
                            RAIDList.map((conf, i) => (
                                <div
                                    className={`fs-raid-conf-item ${currentRAIDConf.i === i ? 'active' : ''}`}
                                    onClick={() => this.switchRAID.bind(this)(conf, i)}
                                    key={i}
                                >
                                    <img src={RAIDImage} alt="raid-conf-img" />
                                    {
                                        i !== 0 && <Popover
                                            content={lang('移除该RAID配置', 'Remove this RAID')}
                                        >
                                            <Icon
                                                className="fs-remove-raid"
                                                type="close"
                                                onClick={this.removeRAID.bind(this, conf, i)}
                                            />
                                        </Popover>
                                    }
                                    {
                                        !!conf.selectedDisks.length && <Popover
                                            content={lang('该RAID配置完成', 'This RAID is configured')}
                                        >
                                            <Icon
                                                className="fs-raid-conf-ok"
                                                type="check"
                                                onClick={this.removeRAID.bind(this, conf, i)}
                                            />
                                        </Popover>
                                    }
                                </div>
                            ))
                        }
                        <Popover
                            content={lang('添加RAID配置', 'Add RAID')}
                        >
                            <div
                                className="fs-raid-conf-item"
                                onClick={this.addRAID.bind(this)}
                            >
                                <Icon type="plus" />
                            </div>
                        </Popover>
                    </div>
                </div>
                <div className="fs-right-side-wrapper">
                    <div className="fs-raid-info-wrapper">
                        <span className="fs-raid-info-item">RAID {lang('配置信息: ', 'Info: ')}</span>
                        <span className="fs-raid-info-item">
                            {lang('级别', 'Level')}:
                            <Select
                                 style={{width: 85, marginLeft: 15}}
                                 size="small"
                                 placeholder={lang('请选择', 'select')}
                                 value={arrayLevel.name}
                                 onChange={this.switchRAIDLevel.bind(this)}
                            >
                                {
                                    RAIDLevels.map((level, i) => <Select.Option
                                        key={i}
                                        value={level.name}
                                        level={level}
                                    >
                                        {level.name}
                                    </Select.Option>)
                                }
                            </Select>
                        </span>
                        <span className="fs-raid-info-item">{lang('磁盘数量', 'Disk Number')}: {selectedDisks.length}</span>
                        <span className="fs-raid-info-item">{lang('总容量', 'Total Capacity')}: {formatStorageSize(arrayCapacity)}</span>
                        <span className="fs-raid-info-item">
                            {lang('条带大小', 'Stripe Size')}:
                            <Select
                                style={{width: 75, marginLeft: 15}}
                                size="small"
                                placeholder={lang('请选择', 'select')}
                                value={arrayStripeSize}
                                onChange={this.switchStripeSize.bind(this)}
                            >
                                {
                                    stripeSize.map((size, i) => <Select.Option
                                        key={i}
                                        value={size}
                                        size={size}
                                    >
                                        {size}
                                    </Select.Option>)
                                }
                            </Select>
                        </span>
                        <span className="fs-raid-info-item add-disk-tip">{lang('请在下方为该RAID配置添加硬盘', 'Please add the disks for the RAID below')}</span>
                    </div>
                    <div className="fs-raid-custom-wrapper">
                        <FSTransfer
                            className="fs-raid-node-array-selector"
                            ref={ref => this.fsTransferWrapper = ref}
                            notFoundContent=" "
                            titles={[lang('当前可用磁盘', 'Available Disks'), lang('已加入阵列磁盘', 'Disks In Array')]}
                            dataSource={[]}
                            targetItems={selectedDisks}
                            rowKey="diskName"
                            onChange={this.selectedDisksChange.bind(this)}
                            render={({diskName, totalSpace}) => ({
                                label: (
                                    <span>
                                        <Icon type="hdd" style={{marginLeft: 15, marginRight: 15}} />
                                        {diskName}
                                        <span style={{float: 'right'}}>{formatStorageSize(totalSpace)}</span>
                                    </span>
                                ),
                                value: diskName})
                            }
                            footer={() => (
                                <Popover
                                    {...buttonPopoverConf}
                                    content={lang('为该节点应用此RAID配置', 'Apply the RAID configuration for this node')}
                                >
                                    <Button
                                        style={{margin: 5, float: 'right'}}
                                        size="small"
                                        type="primary"
                                        disabled={!enableApplyButton}
                                        onClick={this.applyConfForNode.bind(this)}
                                    >
                                        {lang('应用', 'Apply')}
                                    </Button>
                                </Popover>
                            )}
                        />
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {dashboard: {customRAIDList}}} = state;
    return {language, customRAIDList};
};

const mapDispatchToProps = dispatch => {
    return {
        setCustomRAIDList: customRAIDList => dispatch(dashboardAction.setCustomRAIDList(customRAIDList)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CustomRAIDForService);