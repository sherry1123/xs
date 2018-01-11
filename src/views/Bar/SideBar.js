import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Menu, Icon} from 'antd';
import lang from '../../components/Language/lang';

class SideBar extends Component {
    render (){
        return (
            <aside className='fs-side-bar-wrapper'>
                <Menu
                    style={{width: 200}}
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                >
                    <Menu.SubMenu title={<span><Icon type="file-text" /><span>{lang('元数据节点', 'Metadata Nodes')}</span></span>}>
                        <Menu.Item key="1">{lang('概述', 'Overview')}</Menu.Item>
                        <Menu.Item key="2">{lang('节点详情', 'Node Details')}</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="hdd" /><span>{lang('存储节点', 'Storage Nodes')}</span></span>}>
                        <Menu.Item key="3">{lang('概述', 'Overview')}</Menu.Item>
                        <Menu.Item key="4">{lang('节点详情', 'Node Details')}</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="line-chart" /><span>{lang('客户端统计数据', 'Client Statistics')}</span></span>}>
                        <Menu.Item key="5">{lang('元数据', 'Metadata')}</Menu.Item>
                        <Menu.Item key="6">{lang('存储', 'Storage')}</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="dot-chart" /><span>{lang('用户统计信息', 'User Statistics')}</span></span>}>
                        <Menu.Item key="7">{lang('元数据', 'Metadata')}</Menu.Item>
                        <Menu.Item key="8">{lang('存储', 'Storage')}</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="appstore-o" /><span>{lang('管理', 'Management')}</span></span>}>
                        <Menu.Item key="8">{lang('已知问题', 'Known Problems')}</Menu.Item>
                        <Menu.Item key="9">{lang('日志文件', 'Log File')}</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title={<span><Icon type="setting" /><span>{lang('文件系统操作', 'FS Operation')}</span></span>}>
                        <Menu.Item key="10">{lang('条带设置', 'Stripe Settings')}</Menu.Item>
                        <Menu.Item key="11">{lang('文件浏览器', 'File Browser')}</Menu.Item>
                    </Menu.SubMenu>
                </Menu>
            </aside>
        );
    }
}

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

export default connect(mapStateToProps)(SideBar);