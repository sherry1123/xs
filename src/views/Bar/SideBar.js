import React, {Component} from 'react';
import {Menu, Icon} from 'antd';

export default class SideBar extends Component {
    render (){
        return (
            <aside className='fs-side-bar-wrapper'>
                <Menu
                    style={{width: 200}}
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                >
                    <Menu.SubMenu title={<span><Icon type="file-text" /><span>元数据节点</span></span>}>
                        <Menu.Item key="1">概述</Menu.Item>
                        <Menu.Item key="2">节点详情</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="hdd" /><span>存储节点</span></span>}>
                        <Menu.Item key="3">概述</Menu.Item>
                        <Menu.Item key="4">节点详情</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="line-chart" /><span>客户端统计信息</span></span>}>
                        <Menu.Item key="5">元数据</Menu.Item>
                        <Menu.Item key="6">存储</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="dot-chart" /><span>用户统计信息</span></span>}>
                        <Menu.Item key="7">元数据</Menu.Item>
                        <Menu.Item key="8">存储</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="appstore-o" /><span>管理</span></span>}>
                        <Menu.Item key="8">已知问题</Menu.Item>
                        <Menu.Item key="9">查看日志文件</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="setting" /><span>文件系统操作</span></span>}>
                        <Menu.Item key="10">条带设置</Menu.Item>
                        <Menu.Item key="11">浏览文件</Menu.Item>
                    </Menu.SubMenu>
                </Menu>
            </aside>
        );
    }
}