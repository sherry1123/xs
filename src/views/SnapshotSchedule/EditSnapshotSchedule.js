import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Form, Input, message, Modal} from "antd";
import lang from "../../components/Language/lang";
import httpRequests from '../../http/requests';

class EditSnapshotSchedule extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
            scheduleData: {
                name: '',
                interval: ',',
                deleteRound: false,
                autoDisable: false,
                autoDisableTime: '',
                description: '',
            },
        };
    }

    formValueChange (key, value){
        let scheduleData = Object.assign({}, this.state.scheduleData, {[key]: value});
        this.setState({scheduleData});
    }

    async editSnapshotSchedule (){
        let schedule = Object.assign({}, this.state.scheduleData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.editSnapshotSchedule(schedule);
            httpRequests.getSnapshotScheduleList();
            await this.hide();
            message.success(lang(`编辑定时快照计划 ${schedule.name} 成功！`, `Edit timed snapshot schedule ${schedule.name} successfully!`));
        } catch ({msg}){
            message.error(lang(`编辑定时快照计划 ${schedule.name} 失败，原因：`, `Edit timed snapshot schedule ${schedule.name} failed, reason: ` + msg));
        }
        this.setState({formSubmitting: false});
    }

    show (scheduleData){
        this.setState({
            visible: true,
            formSubmitting: false,
            scheduleData
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render () {
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 5 : 7},
                sm: {span: isChinese ? 5 : 7},
            },
            wrapperCol: {
                xs: {span: isChinese ? 19 : 17},
                sm: {span: isChinese ? 19 : 17},
            }
        };

        return (
            <Modal title={lang('创建定时快照计划', 'Create Timed Snapshot Schedule')}
                   width={400}
                   closable={false}
                   maskClosable={false}
                   visible={this.state.visible}
                   afterClose={this.close}
                   footer={
                       <div>
                           <Button
                               size="small" type="primary"
                               loading={this.state.formSubmitting}
                               onClick={this.editSnapshotSchedule.bind(this)}
                           >
                               {lang('编辑', 'Edit')}
                           </Button>
                           <Button
                               size="small"
                               onClick={this.hide.bind(this)}
                           >
                               {lang('取消', 'Cancel')}
                           </Button>
                       </div>
                   }
            >
                <Form>
                    <Form.Item {...formItemLayout} label={lang('名称', 'Name')}>
                        {this.state.scheduleData.name}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('间隔时间', 'Interval')}>
                        {this.state.scheduleData.interval / 3600} {lang('小时', 'Hour')}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('延时关闭', 'Delay Disable')}>
                        {this.state.autoDisableTime ? this.state.autoDisableTime / 86400 : lang('永不', 'Never')}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            placeholder={lang('描述为选填项', 'description is optional')}
                            value={this.state.scheduleData.description}
                            onChange={({target: {value}}) => {
                                this.formValueChange.bind(this, 'description')(value);
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {snapshot: {snapshotScheduleList}}} = state;
    return {language, snapshotScheduleList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditSnapshotSchedule);