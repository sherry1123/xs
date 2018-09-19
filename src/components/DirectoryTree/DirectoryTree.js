import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, message, Modal, Spin, Tree} from 'antd';
import lang from '../Language/lang';
import httpRequests from '../../http/requests';

class DirectoryTree extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            selectValid: false,
            pathType: 'share', // NASServer, share
            treeNodes: [],
            selectedDirectory: [],
        };
    }

    pathValidationCheck (path){
        if (!!path){
            let checkOk = true;
            let {pathType} = this.state;
            let levels = path.split('/').filter(level => !!level);
            if (pathType === 'NASServer'){
                // NASServer can only select the direct sub-catalog of root '/'
                if (levels.length !== 1){
                    message.warning(lang(
                        'NAS服务器管理的目录只能是根目录的直接子目录，请正确选择！',
                        'The catalog path that managed by NAS server must be the direct sub-catalog of root path, please select correctly.'
                    ));
                    checkOk = false;
                } else if (this.props.NASServerList.some(NASServer => NASServer.path === '/' + levels[0])){
                    // this catalog is already used by a existing NAS server
                    message.warning(lang(
                        '该目录已被某NAS服务器管理，请重新选择！',
                        'This catalog path is already used by another existing NAS server, please select another one.'
                    ));
                    checkOk = false;
                }
            } else {
                // Share can only select NASServer's sub-catalog
                if (levels.length < 2){
                    message.warning(lang(
                        '共享的目录必须是NAS服务器所管理目录的子目录，请正确选择！',
                        'The share catalog must be the sub-catalog that managed by NAS server, please select correctly.'
                    ));
                    checkOk = false;
                } else if (!this.props.NASServerList.some(NASServer => NASServer.path === '/' + levels[0])){
                    // this catalog's ancestor catalog is managed by a NAS server
                    message.warning(lang(
                        '该目录无法做共享，因为其所属的顶层父级目录未被任何NAS服务器管理，请重新选择！',
                        'This catalog path can not be used for sharing, because of it\' top level parent path is not managed by any NAS server, please select another one. '
                    ));
                    checkOk = false;
                }
            }
            return checkOk;
        } else {
            return false;
        }
    }

    selectNode (selectedKeys){
        let [path] = selectedKeys;
        if (!!path){
            let selectValid = this.pathValidationCheck(path);
            if (selectValid){
                this.setState({selectValid, selectedDirectory: selectedKeys});
            } else {
                this.setState({selectValid, selectedDirectory: []});
            }
        }
    }

    renderTreeNodes (nodes){
        return nodes.map((node) => {
            return node.children ?
                <Tree.TreeNode
                    {...node}
                    dataRef={node}
                    icon={({expanded}) => <Icon type={expanded ? 'folder-open' : 'folder'} style={{color: '#ffbf24'}} />}
                >
                    {this.renderTreeNodes(node.children)}
                </Tree.TreeNode> :
                <Tree.TreeNode
                    {...node}
                    dataRef={node}
                    icon={({expanded}) => <Icon type={expanded ? 'folder-open' : 'folder'} style={{color: '#ffbf24'}} />}
                />;
        });
    }

    loadNode (node){
        let path = node.props.dataRef.path;
        return new Promise(async resolve => {
            if (node.props.children){
                return resolve();
            }
            try {
                let children = await httpRequests.getFiles(path);
                // let children = await fetchMock([{name: 'xxx' + Date.now()}, {name: 'yyy' + Date.now() + 1}], path);
                children.forEach(node => this.convertNode(node));
                node.props.dataRef.children = children;
                this.setState({
                    treeNodes: [...this.state.treeNodes],
                });
                resolve();
            } catch (e){
                message.warning(lang('该路径不存在', 'This path is not existed'));
                resolve();
            }
        });
    }

    outputCatalog (){
        let {selectedDirectory: [path]} = this.state;
        if (this.pathValidationCheck(path)){
            let {onSelect} = this.props;
            onSelect && onSelect(path);
            this.setState({visible: false});
        }
    }

    async show (selectedDirectory = [], pathType = 'share'){
        await this.setState({
            visible: true,
            selectValid: this.pathValidationCheck(selectedDirectory[0]),
            pathType,
            treeNodes: [],
            selectedDirectory
        });
        // this is the root path
        let rootNode = {title: '/', key: '/'};
        // get the catalogs under root path
        let children = await httpRequests.getFiles(rootNode.key);
        children.forEach(node => this.convertNode(node));
        rootNode.children = children;
        await this.setState({treeNodes: [rootNode]});
    }

    convertNode (node){
        node.key = node.path;
        node.title = node.name;
        node.isLeaf = node.size < 1;
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let {pathType, treeNodes, selectValid, selectedDirectory} = this.state;
        return (
            <Modal
                title={lang('选择目录', 'Select Catalog')}
                width={400}
                visible={this.state.visible}
                mask={!!this.props.mask}
                closable={false}
                maskClosable={false}
                footer={
                    <div>
                        <Button
                            size='small'
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            type="primary"
                            disabled={!(!!selectedDirectory.length && selectValid)}
                            size='small'
                            onClick={this.outputCatalog.bind(this)}
                        >
                            {lang('确定', 'Ok')}
                        </Button>
                    </div>
                }
            >
                <Spin
                    indicator={<Icon type="loading" style={{fontSize: 18}} spin />}
                    spinning={!treeNodes.length}
                >
                    {
                        !!treeNodes.length && (pathType === 'NASServer' ?
                            <div style={{marginBottom: 10, fontSize: 12}}>
                                {lang('请选择根目录的直接子目录作为NAS服务器管理的目录', 'Please select the direct sub-catalog as the catalog that managed by NAS server')}
                            </div> :
                            <div style={{marginBottom: 10, fontSize: 12}}>
                                {lang('请选择NAS服务器所管理目录的子目录作为共享的目录', 'Please select the the sub-catalog that managed by NAS server as share catalog')}
                            </div>
                        )
                    }
                    {
                        !!treeNodes.length && <div style={{marginBottom: 10, fontSize: 12}}>
                            {lang('已选目录路径：', 'Selected Catalog Path: ')}{this.state.selectedDirectory[0] || lang('无', 'Nothing')}
                        </div>
                    }
                    {
                        !!treeNodes.length && <Tree
                            showIcon
                            multiple={false}
                            defaultExpandedKeys={['/']}
                            selectedKeys={selectedDirectory}
                            loadData={this.loadNode.bind(this)}
                            onSelect={this.selectNode.bind(this)}
                        >
                            {this.renderTreeNodes(treeNodes)}
                        </Tree>
                    }
                </Spin>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {share: {NASServerList}}} = state;
    return {language, NASServerList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(DirectoryTree);