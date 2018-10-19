import React, {Component} from 'react';
import {connect} from 'react-redux';
// import httpRequests from 'Http/requests'
import lang from 'Components/Language/lang';
import EditSystemParameter from './EditSystemParameter'
import {Button, Icon, message, Modal, Popover, Table} from 'antd';

const mapStateToProps = state => {
    let {language, main: {SystemConfiguration: {systemParameterList}}} = state;
    return {language, systemParameterList};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
export default class SystemConfiguration extends Component {
    constructor (props){
        super(props);
        let {systemParameterList} = this.props;
        this.state = {
            systemParameterList,
        };
    }

   /* componentDidMount (){
        httpRequests.getSystemParameterList();
    }
    */

   restoreSetting (){
       const modal = Modal.confirm({
			title: lang('警告', 'Warning'),
			content: <div style={{fontSize: 12}}>
				<p>{lang(`您将要执行还原系统参数设置的操作。`, ``)}</p>
                <p>{lang(`执行该操作之后，您修改的所有系统参数将还原为默认值。`, ``)}</p>
				<p>{lang(`建议：在执行该操作前，请确保您已不再需要当前系统参数的设置。`, `A suggestion: before executing this operation, ensure that you `)}</p>
			</div>,
			keyboard: false,
			iconType: 'exclamation-circle-o',
			okType: 'danger',
			okText: lang('还原设置', 'Delete'),
			cancelText: lang('取消', 'Cancel'),
			onOk: async () => {
                modal.update({cancelButtonProps: {disabled: true}});
				try {
					// await httpRequests.restoreSetting();
					let systemParameterList = Object.assign([], this.state.systemParameterList);
					this.setState({systemParameterList});
					message.success(lang(`还原系统参数设置成功!`, ``));
					// httpRequests.systemParameterList();
				} catch ({msg}){
					message.error(lang(`还原系统参数设置失败, 原因: `, `failed, reason: `) + msg);
				}
                modal.update({cancelButtonProps: {disabled: false}});
			},
			onCancel: () => {

			}
		});
   }

    editSystemParameter (parameterData){
        this.setEditSystemParameterWrapper.getWrappedInstance().show(parameterData);
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let buttonConf = {size: 'small', shape: 'circle', style: {marginRight: 5}};
        let {systemParameterList} = this.state;
        let tableProps = {
            size: 'normal',
            dataSource: systemParameterList,
            pagination: systemParameterList.length > 12 && {
                pageSize:12,
                showTotal: (total, range) => lang(
                    `显示 ${range[0]}-${range[1]} 项，总共 ${total} 项`,
                    `show ${range[0]}-${range[1]} of ${total} items}`
                ),
                size: 'normal',
            },
            rowKey: record => `${record.name}`,
            locale: {
                emptyText: lang('暂无系统参数配置','')
            },
            title: () => (<span className="fs-table-title"><Icon type="setting" />{lang('系统参数设置', 'System Parameter Configuration')}</span>),
			rowClassName: () => 'ellipsis',
            columns:[
                {title: lang('名称', 'Name'), width: 120, dataIndex: 'name',},
                {title: lang('当前值', 'CurrentValue'), width: 120, dataIndex: 'currentValue',
                    render: text => !text ? '' : text
                },
                {title: lang('描述', 'Description'), width: 120, dataIndex: 'description',
                    render: text => !text ? '--' : text
                },
                {title: lang('操作', 'Operations'), width: 80,
                    render: (text, record, index) => <div>
						<Popover {...buttonPopoverConf} content={lang('编辑', 'Edit')}>
							<Button
								{...buttonConf}
                                onClick={this.editSystemParameter.bind(this, record, index)}
								icon="edit"
							>
							</Button>
						</Popover>
                    </div>
                }
            ]
        };
        return (
            <div className="fs-page-content">
                <div className="fs-table-operation-wrapper">
                    <div className="fs-table-operation-button-box">
                        <Button
                            type="danger"
                            size="small"
                            onClick={this.restoreSetting.bind(this)}
                        >
                            {lang('还原所有设置', '')}
                        </Button>
                    </div>
                </div>
                <div className="fs-main-content-wrapper">
                    <Table {...tableProps} />
                </div>
                <EditSystemParameter ref={ref => this.setEditSystemParameterWrapper = ref} />
            </div>

        );
    }
}