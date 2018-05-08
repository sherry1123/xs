import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, message, Modal, Tree} from 'antd';
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
        console.info(selectedKeys);
        this.setState({selectedCatalog: selectedKeys});
    }

    outputCatalog (){
        let {getCatalog} = this.props;
        getCatalog && getCatalog(this.state.selectedCatalog[0]);
    }

    renderTreeNodes (nodes){
        return nodes.map((node) => {
            return node.children ?
                <Tree.TreeNode
                    {...node}
                    dataRef={node}
                    icon={({children}) => <Icon type={children ? 'folder-open' : 'folder'} style={{color: '#ffbf24'}} />}
                >
                    {this.renderTreeNodes(node.children)}
                </Tree.TreeNode> :
                <Tree.TreeNode
                    {...node}
                    dataRef={node}
                    icon={({children}) => <Icon type={children ? 'folder-open' : 'folder'} style={{color: '#ffbf24'}} />}
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

    async show (){
        await this.setState({
            visible: true,
            selectedCatalog: []
        });
        // this is the root path
        let rootNode = {title: '/', key: '/'};
        // get the catalogs under root path
        let children = await httpRequests.getFiles(rootNode.path);
        children.forEach(node => this.convertNode(node));
        rootNode.children = children;
        this.setState({treeNodes: [rootNode]});
    }

    convertNode (node){
        node.key = node.path;
        node.title = node.name;
        if (node.size < 1){
            node.isLeaf = true;
        }
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let {treeNodes, selectedCatalog} = this.state;
        return (
            <Modal
                title={lang('选择导出的目录', 'Select Catalog To Export')}
                width={400}
                visible={this.state.visible}
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
                            {lang('确定', 'Create')}
                        </Button>
                    </div>
                }
            >
                <div>
                    {lang('已选路径：', 'Selected Path: ')}{this.state.selectedCatalog[0] || lang('无', 'Nothing')}
                </div>
                <Tree
                    showIcon
                    multiple={false}
                    defaultExpandedKeys={['/']}
                    loadData={this.loadNode.bind(this)}
                    onSelect={this.selectNode.bind(this)}
                >
                    {this.renderTreeNodes(treeNodes)}
                </Tree>
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