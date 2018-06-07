import React, {Component} from 'react';
import {connect} from 'react-redux';
import generalAction from '../../redux/actions/generalAction';
import {withRouter} from 'react-router-dom';
import {Menu, Icon} from 'antd';
import lang from '../../components/Language/lang';
import routerPath, {pathToMenu} from '../routerPath';

class SideBar extends Component {
    componentWillMount (){
        let {pathname} = this.props.history.location;
        let key = pathname.replace(routerPath.Main, '');
        this.props.changeActivePage(key);
        this.getSubMenuByPath(key);
    }

    componentDidMount (){
        window.onhashchange = () => {
            let key = this.props.history.location.pathname.replace(routerPath.Main, '');
            this.props.changeActivePage(key);
            this.getSubMenuByPath(key);
        };
    }

    componentWillUnmount (){
        window.onhashchange = null;
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
            <aside className={`fs-sidebar-wrapper ${this.props.menuExpand ? '' : 'un-expand'}`}>
                <div className="fs-logo-wrapper">
                    <div className={`fs-logo-link ${this.props.menuExpand ? '' : 'un-expand'}`} />
                </div>
                <Menu
                    inlineIndent={16}
                    selectedKeys={[this.props.activePage]}
                    openKeys={this.props.activeMenu}
                    mode="inline"
                    theme="dark"
                    onClick={this.forwardPage.bind(this)}
                    onOpenChange={this.openMenu.bind(this)}
                >

                    <Menu.Item key={routerPath.Dashboard}>
                        <Icon type="dashboard" /><span className="fs-sidebar-menu-text">{lang('仪表盘', 'Dashboard')}</span>
                    </Menu.Item>
                    <Menu.Item key={routerPath.DataNode}>
                        <Icon type="database" /><span className="fs-sidebar-menu-text">{lang('数据节点', 'Data Node')}</span>
                    </Menu.Item>
                    <Menu.SubMenu
                        key="Snapshot"
                        title={
                            <span>
                                <Icon type="camera-o" title={this.props.menuExpand ? '' : lang('点击展开', 'Click To Expand')} />
                                <span>{lang('快照', 'Snapshot')}</span>
                            </span>
                        }
                    >
                        <Menu.Item key={routerPath.Snapshot}>
                            <Icon type="camera-o" />{lang('快照', 'Snapshot')}
                        </Menu.Item>
                        <Menu.Item key={routerPath.SnapshotSchedule}>
                            <Icon type="schedule" />{lang('定时快照计划', 'Timed Schedule')}
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu
                        key="Share"
                        title={
                            <span>
                                <Icon type="share-alt" title={this.props.menuExpand ? '' : lang('点击展开', 'Click To Expand')} />
                                <span>{lang('共享', 'Share')}</span>
                            </span>
                        }
                    >
                        <Menu.Item key={routerPath.NASServer}>
                            <Icon type="desktop" />{lang('NAS服务器', 'NAS Server')}
                        </Menu.Item>
                        <Menu.Item key={routerPath.NFS}>
                            <Icon type="laptop" />{lang('NFS', 'NFS')}
                        </Menu.Item>
                        <Menu.Item key={routerPath.CIFS}>
                            <Icon type="folder" />{lang('CIFS', 'CIFS')}
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item key={routerPath.ServiceAndClient}>
                        <Icon type="desktop" />{lang('NAS服务器', 'NAS Server')}
                    </Menu.Item>
                    <Menu.SubMenu
                        key="UserAndGroup"
                        title={
                            <span>
                                <Icon type="user" title={this.props.menuExpand ? '' : lang('点击展开', 'Click To Expand')} />
                                <span>{lang('用户与组', 'User And Group')}</span>
                            </span>
                        }
                    >
                        <Menu.Item key={routerPath.LocalAuthUser}>
                            <Icon type="user-add" />{lang('本地认证用户', 'Local Auth. User')}
                        </Menu.Item>
                        <Menu.Item key={routerPath.LocalAuthUserGroup}>
                            <Icon type="usergroup-add" />{lang('本地认证用户组', 'Local Auth. Group')}
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu
                        key="TargetAndBuddyGroup"
                        title={
                            <span>
                                <Icon type="hdd" title={this.props.menuExpand ? '' : lang('点击展开', 'Click To Expand')} />
                                <span>{lang('存储目标', 'Storage Target')}</span>
                            </span>
                        }
                    >
                        <Menu.Item key={routerPath.Target}>
                            <Icon type="hdd" />{lang('存储目标', 'Storage Target')}
                        </Menu.Item>
                        <Menu.Item key={routerPath.BuddyGroup}>
                            <Icon type="api" />{lang('伙伴组', 'Buddy Group')}
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item key={routerPath.SystemLog}>
                        <Icon type="file-text" />{lang('系统日志', 'System Log')}
                    </Menu.Item>
                    <Menu.Item key={routerPath.FSOperation}>
                        <Icon type="setting" />{lang('文件系统操作', 'FS Operation')}
                    </Menu.Item>
                </Menu>
            </aside>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {general: {activeMenu, activePage, menuExpand}}} = state;
    return {language, activeMenu, activePage, menuExpand};
};

const mapDispatchToProps = dispatch => {
    return {
        changeActiveMenu: key => dispatch(generalAction.changeActiveMenu(key)),
        changeActivePage: key => dispatch(generalAction.changeActivePage(key)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default withRouter(connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(SideBar));