import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, message, Modal, Popover, Select} from 'antd';
import pImg from '../../images/primary_target.png';
import sImg from '../../images/secondary_target.png';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';
import {formatStorageSize} from '../../services';

/*
let availableTargets = [
    {targetId: 101, mountPath: "/data/Orcafs-meta", node: "orcadt1", service: "metadata", nodeId: 101, isUsed: false, space: {total: 10415295488, used: 107373568, free: 10307921920, usage: "0.01%"}},
    {targetId: 102, mountPath: "/data/Orcafs-meta", node: "orcadt1", service: "metadata", nodeId: 102, isUsed: false, space: {total: 10415295488, used: 107373568, free: 10307921920, usage: "0.01%"}},
    {targetId: 103, mountPath: "/data/Orcafs-meta", node: "orcadt2", service: "metadata", nodeId: 103, isUsed: false, space: {total: 10415295488, used: 107373568, free: 10307921920, usage: "0.01%"}},
    {targetId: 104, mountPath: "/data/Orcafs-storage", node: "orcadt3", service: "storage", nodeId: 104, isUsed: false, space: {total: 10415295488, used: 107373568, free: 10307921920, usage: "0.01%"}},
    {targetId: 105, mountPath: "/data/Orcafs-storage", node: "orcadt3", service: "storage", nodeId: 105, isUsed: false, space: {total: 10415295488, used: 107373568, free: 10307921920, usage: "0.01%"}},
    {targetId: 106, mountPath: "/data/Orcafs-meta", node: "orcadt2", service: "metadata", nodeId: 106, isUsed: false, space: {total: 10415295488, used: 107373568, free: 10307921920, usage: "0.01%"}},
    {targetId: 107, mountPath: "/data/Orcafs-meta", node: "orcadt1", service: "metadata", nodeId: 107, isUsed: false, space: {total: 10415295488, used: 107373568, free: 10307921920, usage: "0.01%"}},
];
*/

class CreateBuddyGroup extends Component {
    constructor (props){
        super(props);
        let {availableTargets} = this.props;
        availableTargets = this.dropUsedTargets(availableTargets);
        this.state = {
            visible: false,
            formSubmitting: false,
            currentServiceRole: 'metadata',
            availableTargets,
            selectedTargets: [], // index 0 is primary, index 1 is secondary, they can't be in the same node
            preConfigs: [],
        };
    }

    componentWillReceiveProps (nextProps){
        let {availableTargets} = nextProps;
        this.setState({availableTargets});
    }

    dropUsedTargets (targets){
        return targets.filter(target => !target.isUsed);
    }

    serviceRoleChange (currentServiceRole){
        this.setState({currentServiceRole, selectedTargets: []});
    }

    getTargetUID (target){
        return target.targetId + '-' + target.service;
    }

    selectTarget (target, i) {
        // add target into selectedTargets or remove target from it
        let {availableTargets, selectedTargets} = this.state;
        availableTargets = [...availableTargets];
        selectedTargets = [...selectedTargets];
        let alreadySelected = selectedTargets.some(item => this.getTargetUID(item) === this.getTargetUID(target));
        if (!alreadySelected){
            // this target hasn't been selected before
            if (selectedTargets.length < 2){
                if (!!selectedTargets[0]){
                    // if already one target existed, two targets must be in different nodes
                    if (selectedTargets[0].node === target.node){
                        return message.warning(lang('用于配对成伙伴组的存储目标必须在不同的节点上！', 'The targets that used for pairing must be in different nodes.'));
                    }
                    // two targets must have a same capacity
                    if (selectedTargets[0].space.total !== target.space.total){
                        return message.warning(lang('用于配对成伙伴组的存储目标的容量必须相同！', 'The size of their capacity of the targets that used for pairing must be the same.'));
                    }
                }
                selectedTargets.push(target);
            }
        } else {
            // already selected, should remove it from selectedTargets
            selectedTargets = selectedTargets.filter(item => item.targetId !== target.targetId);
        }
        this.setState({availableTargets, selectedTargets});
    }

    addPreConfig () {
        // add to buddyGroup pre-configs
        let {currentServiceRole, availableTargets, selectedTargets, preConfigs} = this.state;
        preConfigs = [...preConfigs];
        selectedTargets = [...selectedTargets];
        let preConfig = {serviceRole: currentServiceRole, selectedTargets};
        preConfigs.push(preConfig);
        // remove selected target from availableTargets
        let selectedTargetUIDs = selectedTargets.map(target => this.getTargetUID(target));
        availableTargets = availableTargets.filter(target => !selectedTargetUIDs.includes(this.getTargetUID(target)));
        this.setState({preConfigs, availableTargets, selectedTargets: [],});
    }

    removePreConfig (preConfig, i){
        let {selectedTargets} = preConfig;
        let {availableTargets, preConfigs} = this.state;
        preConfigs = [...preConfigs];
        preConfigs.splice(i, 1);
        availableTargets = [...availableTargets].concat(selectedTargets).sort((a, b) => a.targetId - b.targetId);
        this.setState({availableTargets, preConfigs,});
    }

    async create (){
        let buddyGroups = [...this.state.preConfigs];
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createBuddyGroup(buddyGroups);
            httpRequests.getBuddyGroupList();
            await this.hide();
            message.success(lang(`创建伙伴组成功!`, `Create buddy group(s) successfully!`));
        } catch ({msg}){
            message.error(lang(`创建伙伴组失败, 原因: `, `Create buddy group(s) failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    async show (){
        let {availableTargets} = this.props;
        availableTargets = this.dropUsedTargets(availableTargets);
        await this.setState({
            visible: true,
            formSubmitting: false,
            currentServiceRole: 'metadata',
            availableTargets,
            selectedTargets: [],
            preConfigs: [],
        });
    }

    hide (){
        this.setState({visible: false,});
    }

    render (){
        let buttonPopoverConf = {mouseEnterDelay: 0.8, mouseLeaveDelay: 0};
        let {formSubmitting, currentServiceRole, availableTargets, selectedTargets: [pTarget = {}, sTarget = {}], preConfigs} = this.state;
        availableTargets = availableTargets.filter(target => target.service === currentServiceRole);
        let serviceRoleMap = {
            metadata: lang('元数据服务', 'Metadata'),
            storage: lang('存储服务', 'Storage'),
        };
        return (
            <Modal
                title={lang(`创建伙伴组`, `Create Buddy Group`)}
                width={900}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            size="small"
                            type="primary"
                            disabled={!preConfigs.length}
                            loading={formSubmitting}
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                    </div>
                }
            >
                <div className="fs-buddy-group-create-wrapper">
                    <div className="fs-buddy-group-create-tip">
                        {lang(
                            '点击2个存储目标再点击配对按钮，将在右侧区域生成1个伙伴组的预配置，允许配对多个预配置。完成后点击创建按钮进行创建。',
                            'Click two storage targets and click pair button, it will generate a buddy group pre-config, more than one is allowed. Click create button to do creation.'
                        )}
                    </div>
                    <div className="fs-buddy-group-pair-wrapper">
                        <div className="fs-buddy-group-pair-content">
                            <div className="fs-buddy-group-target-title">
                                <span>{lang('可配对的存储目标', 'Paired Able Storage Targets')}</span>
                                <Select
                                    style={{float: 'right', marginTop: 7}}
                                    size="small"
                                    value={this.state.currentServiceRole}
                                    onChange={this.serviceRoleChange.bind(this)}
                                >
                                    <Select.Option value="metadata">{lang('元数据服务', 'Metadata')}</Select.Option>
                                    <Select.Option value="storage">{lang('存储服务', 'Storage')}</Select.Option>
                                </Select>
                            </div>
                            <div className="fs-buddy-group-row">
                                <span className="fs-buddy-group-column">{lang('目标ID', 'Target ID')}</span>
                                <span className="fs-buddy-group-column">{lang('所属节点', 'Node')}</span>
                                <span className="fs-buddy-group-column">{lang('挂载路径', 'Service Role')}</span>
                                <span className="fs-buddy-group-column">{lang('容量', 'Capacity')}</span>
                                <span className="fs-buddy-group-column">{lang('状态', 'Status')}</span>
                            </div>
                            {
                                availableTargets.map((target, i) => (
                                    <div className="fs-buddy-group-row" key={i}
                                        onClick={this.selectTarget.bind(this, target, i)}
                                    >
                                        <span className="fs-buddy-group-column">{target.targetId}</span>
                                        <span className="fs-buddy-group-column">{target.node}</span>
                                        <span className="fs-buddy-group-column">{target.mountPath}</span>
                                        <span className="fs-buddy-group-column">{formatStorageSize(target.space.total)}</span>
                                        <span className="fs-buddy-group-column">
                                            {
                                                target.targetId + target.service === pTarget.targetId + pTarget.service ?
                                                    <Popover content={lang('主', 'Primary')}>
                                                        <img className="fs-buddy-group-selected" src={pImg} alt="" />
                                                    </Popover> :
                                                        target.targetId + target.service === sTarget.targetId + sTarget.service ?
                                                            <Popover content={lang('从', 'Secondary')}>
                                                                <img className="fs-buddy-group-selected" src={sImg} alt="" />
                                                            </Popover>:
                                                            ''
                                            }
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="fs-buddy-group-pair-button-wrapper">
                            <Popover {...buttonPopoverConf} content={lang('配对', 'Pair')}>
                                <Button
                                    disabled={this.state.selectedTargets.length !== 2}
                                    type="primary"
                                    shape="circle"
                                    icon="right"
                                    onClick={this.addPreConfig.bind(this)}
                                />
                            </Popover>
                        </div>
                        <div className="fs-buddy-group-pair-content right">
                            <div className="fs-buddy-group-target-title">
                                <span>{lang('已配对的伙伴组预配置', 'Paired Buddy Group Pre-Config')}</span>
                            </div>
                            <div className="fs-buddy-group-row">
                                <span className="fs-buddy-group-column">{lang('序号', 'Number')}</span>
                                <span className="fs-buddy-group-column">{lang('操作', 'Operation')}</span>
                            </div>
                            {
                                preConfigs.map((preConfig, i) => (
                                    <div className="fs-buddy-group-row" key={i}>
                                        <span className="fs-buddy-group-column">
                                            <Popover
                                                content={
                                                    <div>
                                                        <p className="fs-storage-target-popover-item">{lang('服务角色：', 'Service Role: ')}<span>{serviceRoleMap[preConfig.serviceRole]}</span></p>
                                                        <p className="fs-storage-target-popover-item">{lang('主目标ID：', 'Primary Target ID: ')}<span>{preConfig.selectedTargets[0].targetId}</span></p>
                                                        <p className="fs-storage-target-popover-item">{lang('从目标ID：', 'Secondary Target ID: ')}<span>{preConfig.selectedTargets[1].targetId}</span></p>
                                                    </div>
                                                }
                                            >
                                                {lang('伙伴组', 'Buddy Group')} - {i}
                                            </Popover>
                                        </span>
                                        <span className="fs-buddy-group-column">
                                            <Popover {...buttonPopoverConf} content={lang('移除', 'Remove')}>
                                                <Icon
                                                    className="fs-buddy-group-remove"
                                                    type="close"
                                                    onClick={this.removePreConfig.bind(this, preConfig, i)}
                                                />
                                            </Popover>
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {target: {targetList: availableTargets}}} = state;
    return {language, availableTargets};
};

const mapDispatchToProps = {};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateBuddyGroup);