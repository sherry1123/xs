import React, {Component} from 'react';
import {connect} from "react-redux";
import {Button, Icon} from 'antd';
import FSTransfer from '../FSTransfer/FSTransfer';
import lang from '../Language/lang';
import {formatStorageSize} from '../../services/index';

class DiskConfiguration extends Component {
    constructor (props){
        super(props);
        let {metadataServerIPs, storageServerIPs} = props;
        this.usedDiskNamesGroupByNodeIP = {}; // for filter out used disks on single node
        this.state = {
            metadataNodes: this.convertNodes('metadata', metadataServerIPs),
            storageNodes: this.convertNodes('storage', storageServerIPs),
            currentNode: {},
            selectedDisks: [],
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
        // console.info('remove used disks, left: ' + nodeDisks.map(disk => disk.diskname).toString());
        // console.info('node raw selected: ' + node.selectedDisks.map(disk => disk.diskname).toString());
        if (!node.selectedDisks.length){
            // the selected node hasn't done RAID configuration yet
            this.setState({
                currentNode: Object.assign({i}, node), // i is a helpful key for mutating the item in metadataNodes or storageNodes arrays quickly
                nodeDisks,
                selectedDisks: []
            });
        } else {
            // the selected node is configured
            let selectedDisks = node.selectedDisks;
            // console.info('this node selected disks: ' + node.selectedDisks.map(disk => disk.diskname).toString());
            // show disk selection of this node
            let selectedDisksNames = selectedDisks.map(disk => disk.diskname);
            // remove the disks that are already in selectedDisks
            nodeDisks = nodeDisks.filter(disk => !selectedDisksNames.includes(disk.diskname));
            // console.info('node raw allow selected: ' + nodeDisks.map(disk => disk.diskname).toString());
            this.setState({
                currentNode: Object.assign({i}, node),
                nodeDisks,
                selectedDisks,
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

    selectedDisksChange (nextTargetItems/*, direction, moveItems*/){
        this.setState({selectedDisks: nextTargetItems});
    }

    applyConfForNode (){
        let currentNode = this.state.currentNode;
        currentNode.selectedDisks = [...this.state.selectedDisks];
        let nodes = Object.assign(this.state[currentNode.type + 'Nodes']);
        nodes[currentNode.i] = currentNode;
        this.setState({[currentNode.type + 'Nodes']: nodes});
        if (!currentNode.selectedDisks.length){
            delete this.usedDiskNamesGroupByNodeIP[currentNode.ip];
        } else {
            let existedUsedDisks = this.usedDiskNamesGroupByNodeIP[currentNode.ip] || [];
            this.usedDiskNamesGroupByNodeIP[currentNode.ip] = existedUsedDisks.concat(currentNode.selectedDisks);
        }
    }

    exportNodesRAID (){
        let {metadataNodes, storageNodes} = this.state;
        return {metadataNodes, storageNodes};
    }

    render (){
        let {metadataNodes, storageNodes, currentNode, selectedDisks, nodeDisks, enableApplyButton} = this.state;
        return (
            <section className="fs-raid-config-wrapper">
                <div className="fs-raid-config-description">
                    {lang(
                        `如果您不选择开始RAID，那么请先选择节点，再为该节点选择一个并放入右侧框体中，待所需盘都放置完毕后，点击应用按钮，该节点的磁盘即配置完成。
                        请以此方式依次配置完所有的元数据节点和存储节点。为了确保磁盘资源的合理利用和配置的便捷性，请在进行初始化之前规划好每个节点上的磁盘。`,
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
                                    {!!node.selectedDisks.length && <Icon type="check" title={lang('磁盘已配置', 'Disk Configured')} style={{marginLeft: 10, color: '#00cc00'}} />}
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
                            </div>)
                        }
                        {
                            currentNode.hasOwnProperty('ip') &&
                            <FSTransfer
                                className="fs-raid-node-array-selector"
                                notFoundContent=" "
                                titles={[lang('当前可用磁盘', 'Available Disks'), lang('已加入阵列磁盘', 'Disks In Array')]}
                                dataSource={nodeDisks}
                                targetItems={selectedDisks}
                                targetItemOnlyOne={true}
                                rowKey="diskname"
                                onChange={this.selectedDisksChange.bind(this)}
                                render={({diskname, totalspace}) => ({
                                    label: (
                                        <span>
                                            <Icon type="hdd" style={{marginLeft: 15,marginRight: 15}} />
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

export default connect(mapStateToProps)(DiskConfiguration);

