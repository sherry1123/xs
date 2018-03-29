import React, {Component} from 'react';
import {connect} from "react-redux";
import {Button, Icon, message, Select, Transfer} from 'antd';
import lang from '../Language/lang';
import {formatStorageSize} from '../../services';

class RAIDConfiguration extends Component {
    constructor (props){
        super(props);
        let {metadataServerIPs, storageServerIPs} = props;
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
            arrayDisks: [],
            RAIDLevels: [
                {name: 'RAID 0', min: 2, max: '', rule: ''},
                {name: 'RAID 1', min: 2, max: 2, rule: ''},
                {name: 'RAID 5', min: 3, max: '', rule: ''},
                {name: 'RAID 6', min: 4, max: '', rule: ''},
                {name: 'RAID 10', min: 4, max: '', rule: 'even'}
            ],
            arrayLevel: {},
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
        return nodes.map(node => ({ip: node, type, arrayDisks: [], arrayLevel: {}}));
    }

    switchNode (node, i){
        let nodeDisks = this.getNodeDisksByNodeIP(node.ip);
        if (!node.arrayDisks.length){
            // the selected node hasn't done RAID configuration yet
            this.setState({
                currentNode: Object.assign({i}, node), // i is a helpful key for mutating the item in metadataNodes or storageNodes arrays quickly
                nodeDisks,
                arrayDisks: [],
                arrayLevel: {},
                arrayCapacity: 0
            });
        } else {
            // the selected node is configured
            let arrayDisks = node.arrayDisks;
            // show RAID configuration of this node
            let arrayDisksNames = arrayDisks.map(disk => disk.diskname);
            // remove the disks that are already in arrayDisks
            nodeDisks = nodeDisks.filter(disk => !arrayDisksNames.includes(disk.diskname));
            let arrayCapacity = this.calculateArrayCapacity(arrayDisks);
            this.setState({
                currentNode: Object.assign({i}, node),
                nodeDisks,
                arrayDisks,
                arrayLevel: node.arrayLevel,
                arrayCapacity
            });
        }
    }

    getNodeDisksByNodeIP (){
        return [
            {diskname: "/dev/nvme2n1", totalspace: 429604103782, key: '/dev/nvme2n1'},
            {diskname: "/dev/nvme5n1", totalspace: 429604103782, key: '/dev/nvme5n1'},
            {diskname: "/dev/nvme4n1", totalspace: 429604103782, key: '/dev/nvme4n1'},
            {diskname: "/dev/nvme1n1", totalspace: 429604103782, key: '/dev/nvme1n1'},
            {diskname: "/dev/nvme0n1", totalspace: 429604103782, key: '/dev/nvme0n1'},
            {diskname: "/dev/nvme3n1", totalspace: 429604103782, key: '/dev/nvme3n1'}
        ];
    }

    switchRAIDLevel (value, option){
        this.setState({arrayLevel: Object.assign({}, option.props.level)});
    }

    async arrayDisksChange (nextTargetKeys, direction, moveKeys){
        let arrayCapacity = this.calculateArrayCapacity(nextTargetKeys);
        await this.setState({
            arrayDisks: nextTargetKeys,
            arrayCapacity
        });
    }

    calculateArrayCapacity (diskNames){
        let arrayCapacity = 0;
        this.state.nodeDisks.forEach(nodeDisk => {
            diskNames.forEach(diskName => {
                if (nodeDisk.diskname === diskName){
                    arrayCapacity += nodeDisk.totalspace;
                }
            });
        });
        return arrayCapacity;
    }

    checkRAID (){
        // check whether selected arrayDisks match current RAID level rule or not

        return true;
    }

    applyConfForNode (){
        if (this.checkRAID()){
            let currentNode = this.state.currentNode;
            currentNode.arrayDisks = [...this.state.arrayDisks];
            currentNode.arrayLevel = Object.assign({}, this.state.arrayLevel);
            let nodes = Object.assign(this.state[currentNode.type + 'Nodes']);
            nodes[currentNode.i] = currentNode;
            this.setState({[currentNode.type + 'Nodes']: nodes});
        } else {
            // give some tips out according to current RAID level rule,
            // and let user to correct selected arrayDisks
            let level = this.state.arrayLevel.name;
            message.error(this.RAIDLevelTips[level]);
        }
    }

    exportNodesRAID (){
        let {metadataNodes, storageNodes} = this.state;
        return {metadataNodes, storageNodes};
    }

    render (){
        return (
            <section className="fs-raid-config-wrapper">
                <div className="fs-raid-config-description">
                    {lang(`请先选择节点，再选择RAID级别，然后将该节点中要做RAID的盘放入右侧阵列中，待所需盘都放置完毕后，点击应用按钮，该节点的RAID即配置完成。
                        一旦启用RAID配置，请以此方式依次配置完所有的元数据节点和存储节点。为了确保磁盘资源的合理利用和配置的便捷性，请在进行初始化之前规划好每个节点上的磁盘。`,
                        '')
                    }
                </div>
                <div className="fs-raid-config-operation-wrapper">
                    <div className="fs-raid-node-wrapper">
                        <div className="fs-raid-node-type-title">{lang('元数据服务器', 'Metadata Server')}</div>
                        <div className="fs-raid-node-group">
                            {
                                this.state.metadataNodes.map((node, i) => <div className={`fs-raid-node-item ${this.state.currentNode.i === i && this.state.currentNode.type === 'metadata' ? 'active' : ''}`} key={i}
                                    onClick={() => this.switchNode.bind(this, node, i)()}
                                >
                                    {node.ip}
                                    {node.arrayDisks.length && <Icon type="check" title={lang('RAID已配置', 'RAID Configured')} style={{marginLeft: 10, color: '#00cc00'}} />}
                                </div>)
                            }
                        </div>
                        <div className="fs-raid-node-type-title">{lang('存储服务器', 'Storage Server')}</div>
                        <div className="fs-raid-node-group">
                            {
                                this.state.storageNodes.map((node, i) => <div className={`fs-raid-node-item ${this.state.currentNode.i === i && this.state.currentNode.type === 'storage' ? 'active' : ''}`} key={i}
                                    onClick={() => this.switchNode.bind(this, node, i)()}
                                >
                                    {node.ip}
                                    {node.arrayDisks.length && <Icon type="check" title={lang('RAID已配置', 'RAID Configured')} style={{marginLeft: 10, color: '#00cc00'}} />}
                                </div>)
                            }
                        </div>
                    </div>
                    <div className="fs-raid-disk-wrapper">
                        {
                            this.state.currentNode.ip &&
                            (<div className="fs-raid-node-array-info">
                                <div className="fs-raid-node-array-info-title">
                                    <span style={{marginRight: 20}}>{lang('节点IP: ', 'Node IP: ')}{this.state.currentNode.ip}</span>
                                    <span>{lang('类型：', 'Type: ')}{this.state.currentNode.type === 'metadata' ? lang('元数据服务器', 'Metadata Server') : lang('存储服务器', 'Storage Server')}</span>
                                </div>
                                <div className="fs-raid-node-array-info-content">
                                    RAID {lang('级别', 'Level')}：
                                    <Select size="small" style={{width: 100, marginRight: 20}}
                                            placeholder={lang('请选择', 'select')}
                                            value={this.state.arrayLevel.name}
                                            onChange={this.switchRAIDLevel.bind(this)}
                                    >
                                        {
                                            this.state.RAIDLevels.map((level, i) => <Select.Option key={i} value={level.name} level={level}>
                                                {level.name}
                                            </Select.Option>)
                                        }
                                    </Select>
                                    <span style={{marginRight: 20}}>阵列磁盘数量：{this.state.arrayDisks.length}</span>
                                    <span>阵列总容量：{formatStorageSize(this.state.arrayCapacity)}</span>
                                </div>
                            </div>)
                        }
                        {
                            this.state.arrayLevel.name &&
                            (<Transfer className="fs-raid-node-array-selector"
                                 notFoundContent=" "
                                 titles={[lang('可用磁盘', 'Available Disks'), lang('阵列磁盘', 'Disks In Array')]}
                                 dataSource={this.state.nodeDisks}
                                 targetKeys={this.state.arrayDisks}
                                 onChange={this.arrayDisksChange.bind(this)}
                                 render={({diskname, totalspace}) => ({
                                        label: (<span>
                                            <Icon type="hdd" style={{marginLeft: 15,marginRight: 15}} />
                                            <span style={{marginRight: 15}}>{diskname}</span>
                                            {formatStorageSize(totalspace)}
                                        </span>),
                                        value: diskname
                                    })
                                 }
                                 footer={() => (
                                     <Button size="small" icon="save" style={{margin: 5, float: 'right'}}
                                             title={lang('为该节点应用此RAID配置', 'Apply the RAID configuration for this node')}
                                             disabled={!this.state.enableApplyButton}
                                             onClick={this.applyConfForNode.bind(this)}
                                     >
                                         {lang('应用', 'Apply')}
                                     </Button>)
                                 }
                            />)
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