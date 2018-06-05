import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, message, Modal, Spin, Tree} from 'antd';
import lang from "../Language/lang";
import httpRequests from "../../http/requests";

class CatalogTree extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            treeNodes: [],
            selectedCatalog: [],
        };
    }

    selectNode (selectedKeys){
        // console.info(a);
        this.setState({selectedCatalog: selectedKeys});
    }

    outputCatalog (){
        let {onSelect} = this.props;
        onSelect && onSelect(this.state.selectedCatalog[0]);
        this.setState({visible: false});
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

    async show (selectedCatalog = []){
        await this.setState({
            visible: true,
            treeNodes: [],
            selectedCatalog
        });
        // this is the root path
        let rootNode = {title: '/', key: '/'};
        // get the catalogs under root path
        let children = await httpRequests.getFiles(rootNode.key);
        children.forEach(node => this.convertNode(node));
        rootNode.children = children;
        this.setState({treeNodes: [rootNode]});
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
        let {treeNodes, selectedCatalog} = this.state;
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
                            disabled={!selectedCatalog.length}
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
                        !!treeNodes.length && <div style={{marginBottom: 10, fontSize: 12}}>
                            {lang('已选目录路径：', 'Selected Catalog Path: ')}{this.state.selectedCatalog[0] || lang('无', 'Nothing')}
                        </div>
                    }
                    {
                        !!treeNodes.length && <Tree
                            showIcon
                            multiple={false}
                            defaultExpandedKeys={['/']}
                            defaultSelectedKeys={selectedCatalog}
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
    const {language} = state;
    return {language};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CatalogTree);