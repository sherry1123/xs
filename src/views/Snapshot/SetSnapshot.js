import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, Popover, Slider} from 'antd';
import lang from "../../components/Language/lang";
import httpRequests from '../../http/requests';
import {validateNotZeroInteger} from "../../services";

class SetSnapshot extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            totalLimitation: 512, // allowed maximum 512, recommended is 1-64 for optimum performance
            totalSnapshotNumber: 0,
            timedSnapshotNumber: 0,
            manualSnapshotNumber: 0,
            formValid: false,
            formSubmitting: false,
            editQuotaMode: false,
            settingData: this.props.snapshotSetting,
            validation: {
                total: {status: '', help: '', valid: false},
                auto: {status: '', help: '', valid: false},
            },
        };
    }

    componentWillReceiveProps (nextProps){
        let {snapshotList} = nextProps;
        let {totalSnapshotNumber, timedSnapshotNumber, manualSnapshotNumber,} = this.getSnapshotNumber(snapshotList);
        this.setState({totalSnapshotNumber, timedSnapshotNumber, manualSnapshotNumber,});
    }

    getSnapshotNumber (snapshotList){
        let totalSnapshotNumber = 0;
        let timedSnapshotNumber = 0;
        let manualSnapshotNumber = 0;
        snapshotList.forEach(({isAuto}) => !!++ totalSnapshotNumber && (isAuto ? timedSnapshotNumber ++ : manualSnapshotNumber ++));
        return {totalSnapshotNumber, timedSnapshotNumber, manualSnapshotNumber};
    }

    async numberInputLengthCut (key, allowLength){
        let settingData;
        if (!validateNotZeroInteger(this.state.settingData[key])){
            // can't be started with 0
            settingData = Object.assign({}, this.state.settingData);
            settingData[key] = null;
        } else {
            let numberStr = this.state.settingData[key].toString();
            // default maximum to 999, 3 digit number
            allowLength = allowLength || 3;
            if (numberStr.length > allowLength){
                settingData = Object.assign({}, this.state.settingData);
                settingData[key] = Number(numberStr.slice(0, allowLength));
            }
        }
        await this.setState(settingData);
    }

    formValueChange (key, value){
        value = Number(value);
        let settingData = Object.assign({}, this.state.settingData, {[key]: value});
        if (key === 'total'){
            // calculate 6:4 ratio by default
            settingData.auto = Math.round(settingData.total * 0.6);
            settingData.manual = Math.round(settingData.total * 0.4);
        }
        if (key === 'auto'){
            settingData.manual = settingData.total - value;
        }
        this.setState({settingData});
    }

    async validationUpdateState (key, value, valid) {
        let validation = Object.assign({}, this.state.validation);
        validation[key] = {
            status: (value.cn || value.en) ? 'error' : '',
            help: lang(value.cn, value.en),
            valid
        };
        await this.setState({validation});
    }

    async validateForm (key){
        let {totalLimitation, totalSnapshotNumber, timedSnapshotNumber, manualSnapshotNumber, settingData: {total, auto, manual}} = this.state;
        if (key === 'total'){
            if (total > this.state.totalLimitation){
                await this.validationUpdateState('total', {
                    cn: `快照总数量超过了允许的最大值 ${totalLimitation}`,
                    en: `Snapshot total number exceeds the maximum allowable value ${totalLimitation}`
                }, false);
            } else if (total < totalSnapshotNumber){
                await this.validationUpdateState('total', {
                    cn: `快照总数量不能小于当前已存在的快照的数量 ${totalSnapshotNumber}，清先删除一些快照再执行此操作`,
                    en: `Snapshot total number less than existing snapshots count ${totalLimitation}, please delete some snapshots before doing this operation`
                }, false);
            } else {
                await this.validationUpdateState('total', {cn: '', en: ''}, true);
            }
        }

        if (key === 'auto'){
            if (auto < timedSnapshotNumber){
                await this.validationUpdateState('auto', {
                    cn: `定时快照数量不能小于当前已存在的定时快照的数量 ${timedSnapshotNumber}。若要执行此操作，请先删除一些定时快照`,
                    en: `Timed snapshot number less than existing timed snapshots count ${timedSnapshotNumber}, please delete some timed snapshots before doing this operation`
                }, false);
            } else if (manual < manualSnapshotNumber){
                await this.validationUpdateState('auto', {
                    cn: `手动快照数量不能小于当前已存在的定时快照的数量 ${manualSnapshotNumber}。若要执行此操作，请先删除一些手动快照`,
                    en: `Manual snapshot number less than existing manual snapshots count ${manualSnapshotNumber}, please delete some manual snapshots before doing this operation`
                }, false);
            } else {
                await this.validationUpdateState('auto', {cn: '', en: ''}, true);
            }
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    async saveSetting (){
        let settingData = Object.assign({}, this.state.settingData);
        this.setState({formSubmitting: true});
        try {
            await httpRequests.updateSnapshotSetting(settingData);
            httpRequests.getSnapshotSetting();
            await this.hide();
            message.success(lang('保存快照设置成功!', 'Save snapshot setting successfully!'));
        } catch ({msg}){
            message.error(lang('保存快照设置失败, 原因: ', 'Save snapshot setting failed, reason: ') + msg);
        }
        this.setState({formSubmitting: false});
    }

    show (){
        let {snapshotSetting: settingData, snapshotList} = this.props;
        let {totalSnapshotNumber, timedSnapshotNumber, manualSnapshotNumber,} = this.getSnapshotNumber(snapshotList);
        this.setState({
            visible: true,
            totalSnapshotNumber,
            timedSnapshotNumber,
            manualSnapshotNumber,
            formValid: true, // we consider the data are all right at the first time
            formSubmitting: false,
            editQuotaMode: false,
            settingData,
            validation: {
                total: {status: '', help: '', valid: true},
                auto: {status: '', help: '', valid: true},
            },
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
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
            <Modal
                title={lang('快照数量设置', 'Snapshot Number Setting')}
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
                            type="warning"
                            disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            size='small'
                            onClick={this.saveSetting.bind(this)}
                        >
                            {lang('应用', 'Apply')}
                        </Button>
                    </div>
                }
            >
                <Form className="fs-snapshot-setting-form">
                    <Form.Item {...formItemLayout}
                        label={lang('总数量', 'Total Number')}
                        validateStatus={this.state.validation.total.status}
                        help={this.state.validation.total.help}
                    >
                        <Input
                            size='small' style={{width: 200}}
                            placeholder={lang('快照总数量', 'Snapshot Total Number')}
                            value={this.state.settingData.total}
                            onChange={async ({target: {value}}) => {
                                await this.formValueChange.bind(this, 'total')(value);
                                await this.numberInputLengthCut.bind(this, 'total', 3)();
                                this.validateForm.bind(this, 'total')();
                            }}
                        />
                        <Popover
                            placement="right"
                            content={lang(
                                '快照总数量最大允许512个。为确保系统的最佳性能，推荐设置为1至64之间的值',
                                'Total snapshot number limitation is 512, to ensure system\'s optimum performance, the number is recommended to set between 1 and 64'
                            )}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-l" />
                        </Popover>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('数量配额', 'Number Quota')}>
                        {
                            !this.state.editQuotaMode && <span>
                                <span>
                                    {lang('定时允许 ', 'Timed allow ')}
                                    {Number(this.state.settingData.auto)}
                                    {lang(' 个,', ',')}
                                </span>
                                <span style={{margin: '0 10px'}}>
                                    {lang('手动允许 ', 'Manual allow ')}
                                    {Number(this.state.settingData.total) - Number(this.state.settingData.auto)}
                                    {isChinese ? ' 个' : ''}
                                </span>
                                <Popover content={lang('修改快照数量配置。', 'Edit snapshot number quota.')}>
                                    <Icon type="edit" className="fs-snapshot-setting-eit-quota" onClick={() => this.setState({editQuotaMode: !this.state.editQuotaMode})} />
                                </Popover>
                            </span>
                        }
                        {
                            this.state.editQuotaMode && <Popover
                                placement="right"
                                content={lang(
                                    '推荐的定时快照数量和手动快照数量的比例为 6:4，请下面的拖动滑块来调整配额。各类型快照的数量不能被设置来小于其当前已有数量。',
                                    'The recommended timed snapshot number and manual snapshot number ratio is 6:4, please drag the slider below to adjust the quota. Number of snapshot of each type can\'t be set less than its current number'
                                )}
                            >
                                <Icon type="question-circle-o" className="fs-info-icon m-l" />
                            </Popover>
                        }
                    </Form.Item>
                    {
                        this.state.editQuotaMode && <Form.Item
                            validateStatus={this.state.validation.auto.status}
                            help={this.state.validation.auto.help}
                        >
                            <div className="fs-snapshot-setting-slider-wrapper">
                            <span className="fs-snapshot-setting-count" style={{width: isChinese ? 60 : 65}}>
                                {lang('定时', 'Timed')} <span>{this.state.settingData.auto}</span>
                            </span>
                                <Slider
                                    className="fs-snapshot-setting-slider"
                                    style={{width: isChinese ? 212 : 190}}
                                    disabled={this.state.settingData.total > this.state.totalLimitation}
                                    max={Number(this.state.settingData.total)}
                                    value={Number(this.state.settingData.auto)}
                                    tipFormatter={null}
                                    onChange={async value => {
                                        await this.formValueChange.bind(this, 'auto')(value);
                                        this.validateForm.bind(this, 'auto')();
                                    }}
                                />
                                <span className="fs-snapshot-setting-count" style={{width: isChinese ? 60 : 75}}>
                                {lang('手动', 'Manual')} <span>{this.state.settingData.manual}</span>
                            </span>
                            </div>
                        </Form.Item>
                    }
                    <div className="fs-snapshot-setting-reference">
                        {lang(
                            `当前已有定时快照 ${this.state.timedSnapshotNumber} 个，手动快照 ${this.state.manualSnapshotNumber} 个`,
                            `Currently there are ${this.state.timedSnapshotNumber} timed and ${this.state.manualSnapshotNumber} manual snapshots exist`
                        )}
                    </div>
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {snapshot: {snapshotList, snapshotSetting}}} = state;
    return {language, snapshotSetting, snapshotList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(SetSnapshot);