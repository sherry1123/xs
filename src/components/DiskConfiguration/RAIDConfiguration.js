import React, {Component} from 'react';
import {connect} from "react-redux";
import {Button, Icon, message, Select} from 'antd';
import FSTransfer from '../FSTransfer/FSTransfer';
import lang from '../Language/lang';
import {formatStorageSize} from '../../services';

class RAIDConfiguration extends Component {
    constructor (props){
        super(props);
        let {metadataServerIPs, storageServerIPs} = props;
        this.usedDiskNamesGroupByNodeIP = {}; // for filter out used disks on single node
        this.RAIDLevelTips = {
            'RAID 0': 'xxx',
            'RAID 1': 'xxx',
            'RAID 5': 'xxx',
            'RAID 6': 'xxx',
            'RAID 10': 'xx'
        };
        this.state = {
            metadataNodes: this.convertNodes('metadata', metadataServerIPs),
            storageNodes: this.convertNodes('storage', storageServerIPs),
            currentNode: {},
            nodeDisks: [
                {diskname: "/dev/nvme2n1", totalspace: 429604103782, key: '/dev/nvme2n1'},
                {diskname: "/dev/nvme5n1", totalspace: 429604103782, key: '/dev/nvme5n1'},
                {diskname: "/dev/nvme4n1", totalspace: 429604103782, key: '/dev/nvme4n1'},
                {diskname: "/dev/nvme1n1", totalspace: 429604103782, key: '/dev/nvme1n1'},
                {diskname: "/dev/nvme0n1", totalspace: 429604103782, key: '/dev/nvme0n1'},
                {diskname: "/dev/nvme3n1", totalspace: 429604103782, key: '/dev/nvme3n1'}
            ],
            selectedDisks: [],
            RAIDLevels: [
                {name: 'RAID 0', min: 2, max: '', rule: ''},
                {name: 'RAID 1', min: 2, max: 2, rule: ''},
                {name: 'RAID 5', min: 3, max: '', rule: ''},
                {name: 'RAID 6', min: 4, max: '', rule: ''},
                {name: 'RAID 10', min: 4, max: '', rule: 'even'}
            ],
            arrayLevel: {},
            stripeSize: ['2KB', '4KB', '8KB', '16KB', '32KB', '64KB', '128KB', '256KB'],
            arrayStripeSize: '8KB',  // default to 8KB
            arrayCapacity: 0,
            enableApplyButton: true,
        }
    }

    componentWillReceiveProps (nextProps){
        let {metadataServerIPs, storageServerIPs} = nextProps;
        let metadataNodes = this.convertNodes('metadata', metadataServerIPs);
        let storageNodes = this.convertNodes('storage', storageServerIPs);
        this.setState({metadataNodes, storageNodes});
    }

    convertNodes (type, nodes){
        return nodes.map(node => ({type, ip: node, selectedDisks: [], arrayLevel: {}}));
    }

    switchNode (node, i){
        let nodeDisks = this.getNodeDisksByNodeIP(node.ip);
        // if some disks on one node are used on metadata server, they can't be used on storage server, and vice versa,
        // this is aimed at the situation that metadata and storage servers are create on one same node
        let usedDisks = this.usedDiskNamesGroupByNodeIP[node.ip];
        if (usedDisks){
            let usedDiskNames = usedDisks.map(disk => disk.diskname);
            // console.info(usedDiskNames);
            if (!!usedDisks){
                nodeDisks = nodeDisks.filter(disk => !usedDiskNames.includes(disk.diskname));
            }
        }
        if (!node.selectedDisks.length){
            // the selected node hasn't done RAID configuration yet
            this.setState({
                currentNode: Object.assign({i}, node), // i is a helpful key for mutating the item in metadataNodes or storageNodes arrays quickly
                nodeDisks,
                selectedDisks: [],
                arrayLevel: {},
                arrayStripeSize: '8KB',
                arrayCapacity: 0
            });
        } else {
            // the selected node is configured
            let selectedDisks = node.selectedDisks;
            // console.info('this node selected disks: ' + node.selectedDisks.map(disk => disk.diskname).toString());
            // show RAID configuration of this node
            let selectedDisksNames = selectedDisks.map(disk => disk.diskname);
            // remove the disks that are already in selectedDisks
            nodeDisks = nodeDisks.filter(disk => !selectedDisksNames.includes(disk.diskname));
            // console.info('node raw allow selected: ' + nodeDisks.map(disk => disk.diskname).toString());
            let arrayCapacity = this.calculateArrayCapacity(selectedDisks);
            this.setState({
                currentNode: Object.assign({i}, node),
                nodeDisks,
                selectedDisks,
                arrayLevel: node.arrayLevel,
                arrayStripeSize: node.stripeSize,
                arrayCapacity
            });
        }
    }

    getNodeDisksByNodeIP (){
        // should fetch them from server through API
        return [
            {diskname: "/dev/nvme0n1", totalspace: 429604103782, key: '/dev/nvme0n1'},
            {diskname: "/dev/nvme1n1", totalspace: 429604103782, key: '/dev/nvme1n1'},
            {diskname: "/dev/nvme2n1", totalspace: 429604103782, key: '/dev/nvme2n1'},
            {diskname: "/dev/nvme3n1", totalspace: 429604103782, key: '/dev/nvme3n1'},
            {diskname: "/dev/nvme4n1", totalspace: 429604103782, key: '/dev/nvme4n1'},
            {diskname: "/dev/nvme5n1", totalspace: 429604103782, key: '/dev/nvme5n1'}
        ];
    }

    switchRAIDLevel (value, option){
        this.setState({arrayLevel: Object.assign({}, option.props.level)});
    }

    switchStripeSize (value, option){
        console.info(option.props.size);
        this.setState({arrayStripeSize: option.props.size});
    }

    selectedDisksChange (nextTargetItems/*, direction, moveItems*/){
        let arrayCapacity = this.calculateArrayCapacity(nextTargetItems);
        this.setState({selectedDisks: nextTargetItems, arrayCapacity});
    }

    calculateArrayCapacity (disks){
        let arrayCapacity = 0;
        disks.forEach(disk => arrayCapacity += disk.totalspace);
        return arrayCapacity;
    }

    checkRAID (){
        // check whether selected selectedDisks match current RAID level rule or not

        return true;
    }

    applyConfForNode (){
        if (this.checkRAID()){
            let currentNode = this.state.currentNode;
            currentNode.selectedDisks = [...this.state.selectedDisks];
            currentNode.arrayLevel = Object.assign({}, this.state.arrayLevel);
            currentNode.stripeSize = this.state.stripeSize;
            let nodes = Object.assign(this.state[currentNode.type + 'Nodes']);
            nodes[currentNode.i] = currentNode;
            this.setState({[currentNode.type + 'Nodes']: nodes});
            if (!currentNode.selectedDisks.length){
                delete this.usedDiskNamesGroupByNodeIP[currentNode.ip];
            } else {
                let existedUsedDisks = this.usedDiskNamesGroupByNodeIP[currentNode.ip] || [];
                this.usedDiskNamesGroupByNodeIP[currentNode.ip] = existedUsedDisks.concat(currentNode.selectedDisks);
            }
        } else {
            // give some tips out according to current RAID level rule,
            // and let user to correct selected selectedDisks
            let level = this.state.arrayLevel.name;
            message.error(this.RAIDLevelTips[level]);
        }
    }

    exportNodesRAID (){
        let {metadataNodes, storageNodes} = this.state;
        return {metadataNodes, storageNodes};
    }

    render (){
        // console.info('render selected disks: ' + this.state.selectedDisks.map(disk => disk.diskname).toString());
        let {metadataNodes, storageNodes, currentNode, RAIDLevels, arrayLevel, stripeSize, arrayStripeSize, selectedDisks, nodeDisks, arrayCapacity, enableApplyButton} = this.state;

        return (
            <section className="fs-raid-config-wrapper">
                <div className="fs-raid-config-description">
                    {lang(
                        `请先选择节点，再选择RAID级别，然后将该节点中要做RAID的盘放入右侧阵列中，待所需盘都放置完毕后，点击应用按钮，该节点的RAID即配置完成。
                        一旦启用RAID配置，请以此方式依次配置完所有的元数据节点和存储节点。为了确保磁盘资源的合理利用和配置的便捷性，请在进行初始化之前规划好每个节点上的磁盘。`,
                        ``
                    )}
                </div>
                <div className="fs-raid-config-operation-wrapper">
                    <div className="fs-raid-node-wrapper">
                        <div className="fs-raid-node-type-title">{lang('元数据服务器', 'Metadata Server')}</div>
                        <div className="fs-raid-node-group">
                            {
                                metadataNodes.map((node, i) => <div
                                    className={`fs-raid-node-item ${currentNode.i === i && currentNode.type === 'metadata' ? 'active' : ''}`} key={i}
                                    onClick={() => this.switchNode.bind(this, node, i)()}
                                >
                                    {node.ip}
                                    {!!node.selectedDisks.length && <Icon type="check" title={lang('RAID已配置', 'RAID Configured')} style={{marginLeft: 10, color: '#00cc00'}} />}
                                </div>)
                            }
                        </div>
                        <div className="fs-raid-node-type-title">{lang('存储服务器', 'Storage Server')}</div>
                        <div className="fs-raid-node-group">
                            {
                                storageNodes.map((node, i) => <div
                                    className={`fs-raid-node-item ${currentNode.i === i && currentNode.type === 'storage' ? 'active' : ''}`} key={i}
                                    onClick={() => this.switchNode.bind(this, node, i)()}
                                >
                                    {node.ip}
                                    {!!node.selectedDisks.length && <Icon type="check" title={lang('RAID已配置', 'RAID Configured')} style={{marginLeft: 10, color: '#00cc00'}} />}
                                </div>)
                            }
                        </div>
                    </div>
                    <div className="fs-raid-disk-wrapper">
                        {
                            currentNode.hasOwnProperty('ip') &&
                            (<div className="fs-raid-node-array-info">
                                <div className="fs-raid-node-array-info-title">
                                    <span style={{marginRight: 20}}>{lang('节点IP: ', 'Node IP: ')}{currentNode.ip}</span>
                                    <span>{lang('类型：', 'Type: ')}{currentNode.type === 'metadata' ? lang('元数据服务器', 'Metadata Server') : lang('存储服务器', 'Storage Server')}</span>
                                </div>
                                <div className="fs-raid-node-array-info-content">
                                    RAID {lang('级别', 'Level')}：
                                    <Select
                                        size="small" style={{width: 100, marginRight: 20}}
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
                                    <span style={{marginRight: 20}}>阵列磁盘数量：{selectedDisks.length}</span>
                                    <span style={{marginRight: 20}}>阵列总容量：{formatStorageSize(arrayCapacity)}</span>
                                    <span>条带大小：</span>
                                    <Select
                                        size="small" style={{width: 100, marginRight: 20}}
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
                                </div>
                            </div>)
                        }
                        {
                            arrayLevel.hasOwnProperty('name') &&
                            <FSTransfer
                                className="fs-raid-node-array-selector"
                                notFoundContent=" "
                                titles={[lang('当前可用磁盘', 'Available Disks'), lang('已加入阵列磁盘', 'Disks In Array')]}
                                dataSource={nodeDisks}
                                targetItems={selectedDisks}
                                rowKey="diskname"
                                onChange={this.selectedDisksChange.bind(this)}
                                render={({diskname, totalspace}) => ({
                                    label: (
                                        <span>
                                            <Icon type="hdd" style={{marginLeft: 15, marginRight: 15}} />
                                            <span style={{marginRight: 15}}>{diskname}</span>
                                            {formatStorageSize(totalspace)}
                                        </span>
                                    ),
                                    value: diskname})
                                }
                                footer={() => (
                                    <Button
                                        size="small" icon="save" style={{margin: 5, float: 'right'}}
                                        title={lang('为该节点应用此RAID配置', 'Apply the RAID configuration for this node')}
                                        disabled={!enableApplyButton}
                                        onClick={this.applyConfForNode.bind(this)}
                                    >
                                        {lang('应用', 'Apply')}
                                    </Button>)
                                }
                            />
                        }
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, initialize: {metadataServerIPs, storageServerIPs}} = state;
    return {language, metadataServerIPs, storageServerIPs};
};

export default connect(mapStateToProps)(RAIDConfiguration);