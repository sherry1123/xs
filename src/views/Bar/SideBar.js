import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Affix, Menu, Icon} from 'antd';
import mainAction from '../../redux/actions/mainAction';
import lang from '../../components/Language/lang';
import routerPath, {pathToMenu} from '../routerPath';

class SideBar extends Component {
    constructor (props){
        super(props);
        let {pathname} = this.props.history.location;
        let key = pathname.replace(routerPath.Main, '');
        this.props.changeActivePage(key);
        this.getSubMenuByPath(key);
        this.state = {
            direction: 'down'
        };
    }

    switchScrollDirection (direction){
        this.setState({direction});
    }

    forwardPage ({key}){
        let {pathname: currentPath} = this.props.history.location;
        let targetPath = routerPath.Main + key;
        if (currentPath !== targetPath){
            this.props.changeActivePage(key);
            this.props.history.push(targetPath);
        }
    }

    getSubMenuByPath (path){
        Object.keys(pathToMenu).forEach(menu => {
            let paths = pathToMenu[menu];
            if (paths.includes(path)){
                this.props.changeActiveMenu([menu]);
            }
        });
    }

    openMenu (openKeys){
        this.props.changeActiveMenu(openKeys)
    }

    render (){
        return (
            <Affix className={`fs-side-bar-wrapper ${this.state.direction}`}>
                <aside >
                    <Menu className="fs-side-bar-menu-wrapper"
                        selectedKeys={[this.props.activePage]}
                        openKeys={this.props.activeMenu}
                        mode="inline"
                        onClick={this.forwardPage.bind(this)}
                        onOpenChange={this.openMenu.bind(this)}
                    >
                        <Menu.SubMenu key="MetadataNodes"
                            title={<span><Icon type="file-text" /><span>{lang('元数据节点', 'Metadata Nodes')}</span></span>}
                        >
                            <Menu.Item key={routerPath.MetadataNodesOverview}>{lang('概述', 'Overview')}</Menu.Item>
                            <Menu.Item key={routerPath.MetadataNodesDetail}>{lang('节点详情', 'Node Details')}</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu key="StorageNodes"
                            title={<span><Icon type="hdd" /><span>{lang('存储节点', 'Storage Nodes')}</span></span>}
                        >
                            <Menu.Item key={routerPath.StorageNodesOverview}>{lang('概述', 'Overview')}</Menu.Item>
                            <Menu.Item key={routerPath.StorageNodesDetail}>{lang('节点详情', 'Node Details')}</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu key="ClientStatistics"
                            title={<span><Icon type="line-chart" /><span>{lang('客户端统计数据', 'Client Statistics')}</span></span>}
                        >
                            <Menu.Item key={routerPath.ClientStatisticsMetadata}>{lang('元数据', 'Metadata')}</Menu.Item>
                            <Menu.Item key={routerPath.ClientStatisticsStorage}>{lang('存储', 'Storage')}</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu key="UserStatistics"
                            title={<span><Icon type="dot-chart" /><span>{lang('用户统计信息', 'User Statistics')}</span></span>}
                        >
                            <Menu.Item key={routerPath.UserStatisticsMetadata}>{lang('元数据', 'Metadata')}</Menu.Item>
                            <Menu.Item key={routerPath.UserStatisticsStorage}>{lang('存储', 'Storage')}</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu key="Management"
                            title={<span><Icon type="appstore-o" /><span>{lang('管理', 'Management')}</span></span>}
                        >
                            <Menu.Item key={routerPath.ManagementKnownProblems}>{lang('已知问题', 'Known Problems')}</Menu.Item>
                            <Menu.Item key={routerPath.ManagementLogFile}>{lang('日志文件', 'Log File')}</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu key="FSOperation"
                            title={<span><Icon type="setting" /><span>{lang('文件系统操作', 'FS Operation')}</span></span>}
                        >
                            <Menu.Item key={routerPath.FSOperationStripeSettings}>{lang('条带设置', 'Stripe Settings')}</Menu.Item>
                            <Menu.Item key={routerPath.FSOperationFileBrowser}>{lang('文件浏览器', 'File Browser')}</Menu.Item>
                        </Menu.SubMenu>
                    </Menu>
                </aside>
            </Affix>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {activeMenu, activePage}} = state;
    return {language, activeMenu, activePage};
};

const mapDispatchToProps = dispatch => {
    return {
        changeActiveMenu: key => dispatch(mainAction.changeActiveMenu(key)),
        changeActivePage: key => dispatch(mainAction.changeActivePage(key)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(SideBar);