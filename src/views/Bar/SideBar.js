import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Menu, Icon} from 'antd';
import mainAction from '../../redux/actions/mainAction';
import {lsSet} from '../../services';
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

    changeMenuExpand (){
        let menuExpand = !this.props.menuExpand;
        this.props.changeMenuExpand(menuExpand);
        lsSet('menuExpand', menuExpand);
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
            <aside className={`fs-sidebar-wrapper ${this.state.direction}  ${this.props.menuExpand ? '' : 'hide'}`}>
                <div className={`fs-visible-operation-wrapper`}>
                    <Icon className="fs-visible-operation-button"
                        type={`${this.props.menuExpand ? 'menu-fold' : 'menu-unfold'}`}
                        title={this.props.menuExpand ? lang('折叠菜单', 'Fold Menu') : lang('展开菜单', 'Expand Menu')}
                        onClick={this.changeMenuExpand.bind(this)}
                    />
                </div>
                <Menu inlineIndent={16}
                    selectedKeys={[this.props.activePage]}
                    openKeys={this.props.activeMenu}
                    mode="inline"
                    onClick={this.forwardPage.bind(this)}
                    onOpenChange={this.openMenu.bind(this)}
                >
                    <Menu.Item key={routerPath.Dashboard}>
                        <Icon type="dashboard" /><span className="fs-sidebar-menu-text">{lang('仪表盘', 'Dashboard')}</span>
                    </Menu.Item>
                    <Menu.Item key={routerPath.MetadataNodes}>
                        <Icon type="hdd" />{lang('元数据节点', 'Metadata Nodes')}
                    </Menu.Item>
                    <Menu.Item key={routerPath.StorageNodes}>
                        <Icon type="database" />{lang('存储节点', 'Storage Nodes')}
                    </Menu.Item>
                    <Menu.Item key={routerPath.ClientStatistics}>
                        <Icon type="line-chart" />{lang('客户端统计', 'Client Statistics')}
                    </Menu.Item>
                    <Menu.Item key={routerPath.UserStatistics}>
                        <Icon type="bar-chart" />{lang('用户统计', 'User Statistics')}
                    </Menu.Item>
                    <Menu.SubMenu key="Management"
                        title={
                            <span>
                                <Icon type="tool" style={{color: this.props.menuExpand ? 'rgba(0, 0, 0, .65)' : '#339966'}} />
                                <span>{lang('管理', 'Management')}</span>
                            </span>
                        }
                    >
                        <Menu.Item key={routerPath.ManagementKnownProblems}>
                            <Icon type="frown-o" />{lang('已知问题', 'Known Problems')}
                        </Menu.Item>
                        <Menu.Item key={routerPath.ManagementLogFile}>
                            <Icon type="file-text" />{lang('日志文件', 'Log File')}
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu key="FSOperation" inlineIndent={16}
                        title={
                            <span>
                                <Icon type="switcher" style={{color: this.props.menuExpand ? 'rgba(0, 0, 0, .65)' : '#9966ff'}} />
                                <span>{lang('文件系统操作', 'FS Operation')}</span>
                            </span>
                        }
                    >
                        <Menu.Item key={routerPath.FSOperationStripeSettings}>
                            <Icon type="setting" />{lang('条带设置', 'Stripe Settings')}
                        </Menu.Item>
                        <Menu.Item key={routerPath.FSOperationFileBrowser}>
                            <Icon type="folder-open" />{lang('文件浏览器', 'File Browser')}
                        </Menu.Item>
                    </Menu.SubMenu>
                </Menu>
            </aside>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {activeMenu, activePage, menuExpand}} = state;
    return {language, activeMenu, activePage, menuExpand};
};

const mapDispatchToProps = dispatch => {
    return {
        changeActiveMenu: key => dispatch(mainAction.changeActiveMenu(key)),
        changeActivePage: key => dispatch(mainAction.changeActivePage(key)),
        changeMenuExpand: menuExpand => dispatch(mainAction.changeMenuExpand(menuExpand)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(SideBar);