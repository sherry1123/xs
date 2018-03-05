import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Menu, Icon} from 'antd';
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
            direction: 'down',
            menuVisible: true
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

    changeMenuVisible (){
        let menuVisible = !this.state.menuVisible;
        this.setState({menuVisible});
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
            <aside className={`fs-sidebar-wrapper ${this.state.direction}  ${this.state.menuVisible ? '' : 'hide'}`}>
                <div className={`fs-visible-operation-wrapper`}>
                    <Button className={`fs-visible-operation-button ${this.state.menuVisible ? '' : 'rock'}`} shape="circle" icon="left" size="small"
                        onClick={this.changeMenuVisible.bind(this)}
                    />
                </div>
                <Menu
                    selectedKeys={[this.props.activePage]}
                    openKeys={this.props.activeMenu}
                    mode="inline"
                    onClick={this.forwardPage.bind(this)}
                    onOpenChange={this.openMenu.bind(this)}
                >
                    <Menu.Item key={routerPath.Dashboard}><Icon type="dashboard" />{lang('仪表盘', 'Dashboard')}</Menu.Item>
                    <Menu.Item key={routerPath.MetadataNodes}><Icon type="file-text" />{lang('元数据节点', 'Metadata Nodes')}</Menu.Item>
                    <Menu.Item key={routerPath.StorageNodes}><Icon type="hdd" />{lang('存储节点', 'Storage Nodes')}</Menu.Item>
                    <Menu.Item key={routerPath.ClientStatistics}><Icon type="line-chart" />{lang('客户端统计', 'Client Statistics')}</Menu.Item>
                    <Menu.Item key={routerPath.UserStatistics}><Icon type="dot-chart" />{lang('用户统计信息', 'User Statistics')}</Menu.Item>
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