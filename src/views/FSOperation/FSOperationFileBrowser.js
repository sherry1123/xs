import React, {Component} from 'react';
import {connect} from "react-redux";
import {Table, Icon} from 'antd';
import {timeFormat} from '../../services';
import lang from '../../components/Language/lang';
import routerPath, {pathToMenu} from '../routerPath';
import mainAction from "../../redux/actions/generalAction";

class FSOperationFileBrowser extends Component {

    componentWillReceiveProps (nextProps){

    }

    forwardStripeSettings (){
        this.props.changeActivePage(routerPath.FSOperationStripeSettings);
        Object.keys(pathToMenu).forEach(menu => {
            let paths = pathToMenu[menu];
            if (paths.includes(routerPath.FSOperationStripeSettings)){
                this.props.changeActiveMenu([menu]);
            }
        });
        this.props.history.push(routerPath.Main + routerPath.FSOperationStripeSettings);
    }

    render (){
        let {fileList} = this.props;
        let tableProps = {
            dataSource: fileList,
            pagination: {size: 'small', pageSize: 20},
            rowKey: 'name',
            columns: [{
                title: lang('名称', 'Name'),
                width: 150,
                dataIndex: 'name'
            }, {
                title: lang('入口', 'Portal'),
                width: 80,
                dataIndex: 'portal'
            }, {
                title: lang('权限', 'Permission'),
                width: 60,
                dataIndex: 'permission'
            }, {
                title: lang('用户', 'User'),
                width: 60,
                dataIndex: 'user'
            }, {
                title: lang('组', 'Group'),
                width: 60,
                dataIndex: 'group'
            }, {
                title: lang('最后状态时间', 'Last Status Time'),
                width: 120,
                dataIndex: 'lastStatusTime',
                render: text => timeFormat(text)
            }, {
                title: lang('最后修改时间', 'Last Modify Time'),
                width: 120,
                dataIndex: 'lastModifyTime',
                render: text => timeFormat(text)
            }, {
                title: lang('最后访问时间', 'Last Access Time'),
                width: 120,
                dataIndex: 'lastAccessTime',
                render: text => timeFormat(text)
            }, {
                title: lang('操作', 'Actions'),
                width: 60,
                render: (text, record, index) => (
                    <div>
                        <a onClick={this.forwardStripeSettings.bind(this)} title={lang('设置', 'Settings')}>
                            <Icon style={{fontSize: 15}} type="setting" />
                        </a>
                    </div>
                )
            }],
        };
        return (
            <section className="fs-page-content">
                <section className="fs-page-item-wrapper title">
                    <h3 className="fs-page-title">{lang('浏览文件器', 'File Browser')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <Table {...tableProps} />
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {fileList}} = state;
    return {language, fileList};
};

const mapDispatchToProps = dispatch => {
    return {
        changeActiveMenu: key => dispatch(mainAction.changeActiveMenu(key)),
        changeActivePage: key => dispatch(mainAction.changeActivePage(key)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FSOperationFileBrowser);