import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Popover, Select, message} from 'antd';
import FSTransfer from '../FSTransfer/FSTransfer';
import RAIDImage from '../../images/raid.png';
import lang from '../Language/lang';
import initializeAction from '../../redux/actions/initializeAction';
import httpRequests from '../../http/requests';
import {formatStorageSize} from '../../services/index';

class CustomRAID extends Component {
    constructor (props){
        super(props);
        let {metadataServerIPs, storageServerIPs} = props;
        // node disks group by node ip
        this.nodeDisksMap = {};
        // used node disks group by node ip
        this.usedDiskNamesGroupByNodeIP = {};
        this.state = {
            // current node contains type and ip
            currentServiceNode: {i: 0, type: 'metadata', ip: metadataServerIPs[0], raidList: []},
            // current RAID conf in current node's RAID list
            currentRAIDConf: {i: -1, arrayLevel: {}, arrayStripeSize: '', selectedDisks: [],},
            // all node
            metadataNodes: this.convertNodes('metadata', metadataServerIPs),
            storageNodes: this.convertNodes('storage', storageServerIPs),
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
            // RAID configuration list of current node
            RAIDList: [],
            // already selected disks in current RAID
            selectedDisks: [],
            // current RAID level, contains level text and rule
            arrayLevel: {name: 'RAID 5', min: 3, max: '', rule: ''},
            // current RAID recommended stripe size
            arrayStripeSize: '8 KB',  // default to 8KB
            // current RAID total capacity
            arrayCapacity: 0,
            // if can apply this RAID configuration for the node, must pass the RAID rule validation
            enableApplyButton: true,
        };
    }

    /*
    componentWillReceiveProps (nextProps){
       let {metadataServerIPs, storageServerIPs} = nextProps;
       let metadataNodes = this.convertNodes('metadata', metadataServerIPs);
       let storageNodes = this.convertNodes('storage', storageServerIPs);
       this.setState({metadataNodes, storageNodes});
    }
    */

    convertNodes (type, nodes) {
        return nodes.map(node => (node.hasOwnProperty('type') ? node : {
            type,
            ip: node,
            raidList: [{i: 0, arrayLevel: {name: 'RAID 5', min: 3, max: '', rule: ''}, arrayStripeSize: '8 KB', selectedDisks: []}], // provide an un-finished RAID conf
        }));
    }

    async changeServiceIP (currentServiceNode){
        let {raidList} = this.state[currentServiceNode.type + 'Nodes'].filter(node => node.ip === currentServiceNode.ip)[0];
        currentServiceNode.raidList = raidList;
        this.setState({currentServiceNode});
        let {type, ip} = currentServiceNode;
        let nodes = this.state[type + 'Nodes'];
        let RAIDList = nodes.filter(node => node.ip === ip)[0].raidList;
        await this.setState({RAIDList});
        await this.switchRAID(raidList[0], 0);
    }

    addRAID (){
        let currentServiceNode = Object.assign({}, this.state.currentServiceNode);
        let nodes = [...this.state[currentServiceNode.type + 'Nodes']];
        let newRAIDIndex = nodes[currentServiceNode.i].raidList.length;
        currentServiceNode.raidList.push({
            i: newRAIDIndex, arrayLevel: {name: 'RAID 5', min: 3, max: '', rule: ''}, arrayStripeSize: '8 KB', selectedDisks: []
        });
        nodes[currentServiceNode.i].raidList = currentServiceNode.raidList;
        this.setState({
            currentServiceNode,
            [currentServiceNode.type + 'Nodes']: nodes,
            RAIDList: currentServiceNode.raidList,
        });
    }

    async removeRAID (conf, i){
        let currentServiceNode = this.state.currentServiceNode;
        currentServiceNode.raidList.splice(i, 1);
        let nodes = [...this.state[currentServiceNode.type + 'Nodes']];
        nodes[currentServiceNode.i].raidList = currentServiceNode.raidList;
        await this.setState({[currentServiceNode.type + 'Nodes']: nodes});
        // reset the used disks record
        this.usedDiskNamesGroupByNodeIP[currentServiceNode.ip] = nodes[currentServiceNode.i].raidList.reduce((prev, curr) => prev.concat(curr.selectedDisks.map(disk => disk)), []);
    }

    async switchRAID (conf, i){
        let {currentServiceNode} = this.state;
        let ip = currentServiceNode.ip;
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
                arrayLevel: {name: 'RAID 5', min: 3, max: '', rule: ''},
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
    }

    async getNodeDisksByNodeIP (ip){
        // If it has already fetched this node's disks, don't fetch them again
        if (!this.nodeDisksMap[ip]){
            let disks = await httpRequests.getNodeDisksByNodeIP(ip);
            this.nodeDisksMap[ip] = disks;
            return  disks;
        } else {
            return this.nodeDisksMap[ip];
        }
        /*
        return [
            {diskName: "/dev/nvme0n1", totalSpace: 429604103782, key: '/dev/nvme0n1'},
            {diskName: "/dev/nvme1n1", totalSpace: 429604103782, key: '/dev/nvme1n1'},
            {diskName: "/dev/nvme2n1", totalSpace: 429604103782, key: '/dev/nvme2n1'},
            {diskName: "/dev/nvme3n1", totalSpace: 429604103782, key: '/dev/nvme3n1'},
            {diskName: "/dev/nvme4n1", totalSpace: 429604103782, key: '/dev/nvme4n1'},
            {diskName: "/dev/nvme5n1", totalSpace: 429604103782, key: '/dev/nvme5n1'}
        ];
        */
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
        let {selectedDisks} = this.state;
        let diskNumber = selectedDisks.length;
        // validate number at lest of disks
        if (min !== '-1'){
             if (diskNumber < min){
                 return false;
             }
        }
        // validate number at most of disks
        if (max !== '-1'){
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
            let currentServiceNode = this.state.currentServiceNode;
            let currentRAIDConf = this.state.currentRAIDConf;
            currentRAIDConf.selectedDisks = [...this.state.selectedDisks];
            currentRAIDConf.arrayLevel = Object.assign({}, this.state.arrayLevel);
            currentRAIDConf.arrayStripeSize = this.state.arrayStripeSize;
            let nodes = [...this.state[currentServiceNode.type + 'Nodes']];
            nodes[currentServiceNode.i].raidList[currentRAIDConf.i] = currentRAIDConf;
            await this.setState({[currentServiceNode.type + 'Nodes']: nodes});
            // reset the used disks record
            this.usedDiskNamesGroupByNodeIP[currentServiceNode.ip] = nodes[currentServiceNode.i].raidList.reduce((prev, curr) => prev.concat(curr.selectedDisks.map(disk => disk)), []);
            message.success(lang('应用RAID配置成功!', 'Apply RAID configuration successfully!'));
            let {metadataNodes, storageNodes} = this.state;
            this.props.setCustomRAID({
                metadataNodes: Object.assign({}, metadataNodes),
                storageNodes: Object.assign({}, storageNodes),
            });
        } else {
            // Give some tips out according to current RAID level rule, and let user to
            // correct selected selectedDisks depend on the requirement of this RAID level.
            let level = this.state.arrayLevel.name;
            message.error(lang(`选择的磁盘不满足 ${level} 的要求，请重新选择！`, `The disks you selected are not match the requirement of ${level}, please correct them!`));
        }
    }

    recommendedRAID (){
        let {recommendedRAID} = this.props;
        (typeof recommendedRAID === 'function') && recommendedRAID();
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let {
            currentServiceNode = {}, currentRAIDConf = {},
            enableApplyButton, RAIDLevels, arrayLevel, arrayStripeSize, arrayCapacity, stripeSize, RAIDList, selectedDisks,
        } = this.state;
        let serviceTypeMap = {
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
                            <span onClick={this.recommendedRAID.bind(this)}>{lang('推荐配置', 'Recommended')}</span>
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
                            {serviceTypeMap[currentServiceNode.type]}<span>{currentServiceNode.ip}</span>
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
                                    <Popover
                                        content={lang('移除该RAID配置', 'Remove this RAID')}
                                    >
                                        <Icon
                                            className="fs-remove-raid"
                                            type="close"
                                            onClick={this.removeRAID.bind(this, conf, i)}
                                        />
                                    </Popover>
                                    {
                                        !!conf.selectedDisks.length &&
                                        <Popover
                                            content={lang('该RAID配置完成', 'This RAID is configurated')}
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
                        <span className="fs-raid-info-item">
                            {lang('RAID级别', 'RAID Level')}:
                            <Select
                                 style={{width: 100, marginLeft: 15}}
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
                        <span className="fs-raid-info-item">{lang('阵列磁盘数量', 'Array Disk Number')}: {selectedDisks.length}</span>
                        <span className="fs-raid-info-item">{lang('阵列总容量', 'Array Total Capacity')}: {formatStorageSize(arrayCapacity)}</span>
                        <span className="fs-raid-info-item">
                            {lang('条带大小', 'Stripe Size')}:
                            <Select
                                style={{width: 100, marginLeft: 15}}
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
    const {language, initialize: {metadataServerIPs, storageServerIPs, customRAID}} = state;
    return {language, metadataServerIPs, storageServerIPs, customRAID};
};

const mapDispatchToProps = dispatch => {
    return {
        setCustomRAID: customRAID => dispatch(initializeAction.setCustomRAID(customRAID)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CustomRAID);