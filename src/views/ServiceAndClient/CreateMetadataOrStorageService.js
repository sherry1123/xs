import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, Icon, Input, message, Modal, notification, Popover} from 'antd';
import RecommendedRAID from 'Components/DiskConfiguration/RecommendedRAID';
import CustomRAIDForService from 'Components/DiskConfiguration/CustomRAIDForService';
import initializeAction from 'Actions/initializeAction';
import dashboardAction from 'Actions/dashboardAction';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';
import {validateIpv4} from 'Services';

class CreateMetadataOrStorageService extends Component {
    constructor (props){
        super(props);
        let {metadataServerIPs = [], storageServerIPs = []} = this.props;
        this.state = {
            visible: false,
            formSubmitting: false,
            metadataServerIPs,
            storageServerIPs,
            currentServiceRole: 'metadata',
            currentServiceIP: '',
            currentServiceIPValidation: {status: '', help: '', valid: false},
            noRAIDRecommendedConfiguration: false,
            enableCustomRAID: false,
        };
    }

    componentWillReceiveProps (nextProps){
        let {metadataServerIPs = [], storageServerIPs = []} = nextProps;
        this.setState({
            metadataServerIPs,
            storageServerIPs,
        });
    }

    async serviceIPChange (currentServiceIP){
        await this.setState({currentServiceIP});
        // validate IP
        if (!currentServiceIP){
            return this.setState({currentServiceIPValidation: {status: 'error', help: lang('请输入IP', 'IP is empty'), valid: false}});
        }
        if (!validateIpv4(currentServiceIP)){
            return this.setState({currentServiceIPValidation: {status: 'error', help: lang('IP格式错误', 'IP pattern is incorrect'), valid: false}});
        }
        let currentServiceIPList = this.props[this.state.currentServiceRole + 'ServerIPs'];
        if (currentServiceIPList.some(ip => ip === currentServiceIP)){
            return this.setState({currentServiceIPValidation: {status: 'error', help: lang('IP已运行有同类型的服务', 'A same type of service is already running on this IP'), valid: false}})
        }
        this.setState({currentServiceIPValidation: {status: '', help: '', valid: true}});
        // change node
        if (!this.state.enableCustomRAID){
            let currentServiceNode = {type: this.state.currentServiceRole, ip: currentServiceIP, i: 0};
            this.recommendedRAIDWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
        } else {
            let currentServiceNode = {type: this.state.currentServiceRole, ip: currentServiceIP, i: 0};
            this.customRAIDForServiceWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
        }
    }

    getRAIDRecommendedConfiguration (ip, delay = 500){
        !!this.blurIPTimer && clearTimeout(this.blurIPTimer);
        this.blurIPTimer = setTimeout(async () => {
            if (this.state.currentServiceIPValidation.valid && !!ip){
                try {
                    // get recommended RAID and change node
                    await httpRequests.getRIADRecommendedConfiguration.apply(null, this.state.currentServiceRole === 'metadata' ? [[ip], []] : [[], [ip]]);
                    let {recommendedRAID} = this.props;
                    // check if recommended RAID configuration is available
                    let noRAIDRecommendedConfiguration = !this.validateRAIDRecommendedConfiguration(recommendedRAID);
                    await this.setState({
                        noRAIDRecommendedConfiguration,
                        enableCustomRAID: noRAIDRecommendedConfiguration,
                    });
                    if (noRAIDRecommendedConfiguration){
                        notification.warning({
                            message: lang('RAID推荐配置不可用', 'RAID Recommended configuration is not available'),
                            description: lang(
                                '没有可用的RAID推荐配置，暂无法使用推荐配置进行服务创建，已为您选择自定义的方式，请手动为该服务储服务配置RAID。',
                                'No available RAID recommended configuration, unable to recommended way to do creation and use custom way instead. Please custom RAID for this service.'
                             )
                        }, 5000);
                    }
                    if (!this.state.enableCustomRAID){
                        let currentServiceNode = {type: this.state.currentServiceRole, ip, i: 0};
                        this.recommendedRAIDWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
                    } else {
                        let currentServiceNode = {type: this.state.currentServiceRole, ip, i: 0};
                        this.customRAIDForServiceWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
                    }
                } catch ({msg}){
                    message.error(lang('获取RAID推荐配置失败，原因' + msg, 'Fetch recommended RAID configuration failed, reason:' + msg));
                }
            } else {
                message.warning(lang('请输入正确的IP', 'Please enter correct IP'));
            }
        }, delay);
    }

    validateRAIDRecommendedConfiguration (RAIDRecommendedConfiguration){
        // the node that user want to create service on must have RAID recommended configuration,
        // otherwise user only can custom RAID configuration to create a service on this node.
        let {currentServiceRole} = this.state; // metadata or storage
        let serverIPs = RAIDRecommendedConfiguration[`${currentServiceRole}ServerIPs`];
        if (!serverIPs.length){
            return false;
        }
        return Object.keys(serverIPs).every(ip => !!serverIPs[ip].length);
    }

    async enableCustomRAID (){
        // switch to custom RAID mode
        let {currentServiceIP, currentServiceRole} = this.state;
        let currentServiceNode = {
            type: currentServiceRole,
            ip: currentServiceIP,
            i: 0,
        };
        await this.setState({
            enableCustomRAID: true,
            currentServiceNode,
        });
        this.customRAIDForServiceWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
    }

    async enableRecommendedRAID (){
        // switch to recommended RAID mode
        let {currentServiceIP, currentServiceRole} = this.state;
        let currentServiceNode = {
            type: currentServiceRole,
            ip: currentServiceIP,
            i: -1
        };
        await this.setState({
            enableCustomRAID: false,
            currentServiceNode,
        });
        this.recommendedRAIDWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
    }

    checkCustomRAID (){
        let {customRAIDList} = this.props;
        return !!customRAIDList.length && customRAIDList.every(conf => !!conf.selectedDisks.length);
    }

    async create (){
        if (this.state.enableCustomRAID && !this.checkCustomRAID()){
            return message.warning(lang(
                '您已开始自定义RAID配置，请为该服务节点正确配置RAID，否则请选择使用RAID推荐配置。',
                'You have enabled custom RAID configuration, please configure the RAID correctly for this service node. Otherwise please select the recommended RAID configuration.')
            );
        }
        let {recommendedRAID, customRAIDList} = this.props;
        let {currentServiceRole, currentServiceIP, enableCustomRAID} = this.state;
        let RAIDConf = !enableCustomRAID ? recommendedRAID[currentServiceRole + 'ServerIPs'] : customRAIDList;
        let raidList = !enableCustomRAID ? RAIDConf[currentServiceIP] : RAIDConf;
        // console.info(RAIDConf, raidList);
        this.setState({formSubmitting: true});
        try {
            currentServiceRole === 'metadata' ?
                await httpRequests.createMetadataServiceToCluster({ip: currentServiceIP, raidList, enableCustomRAID}) :
                await httpRequests.createStorageServiceToCluster({ip: currentServiceIP, raidList, enableCustomRAID});
            httpRequests.getClusterServiceAndClientIPs();
            await this.hide();
            this.clearConfigs();
            if (!this.state.enableCustomRAID){
                this.recommendedRAIDWrapper.getWrappedInstance().clearRAIDConf();
            } else {
                this.customRAIDForServiceWrapper.getWrappedInstance().clearRAIDConf();
            }
            message.success(lang(`创建${currentServiceRole === 'metadata' ? '元数据' : '存储'}服务成功!`, `Create ${currentServiceRole === 'metadata' ? 'metadata' : 'storage'} service successfully!`));
        } catch ({msg}){
            message.error(lang(`创建${currentServiceRole === 'metadata' ? '元数据' : '存储'}服务失败, 原因: `, `Create ${currentServiceRole === 'metadata' ? 'metadata' : 'storage'} service failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    clearConfigs (delayTime = 500){
        // clear configs in redux
        setTimeout(() => {
            let {setRecommendedRAID, setCustomRAIDList} = this.props;
            setRecommendedRAID({metadataServerIPs: {}, storageServerIPs: {}});
            setCustomRAIDList([]);
        }, delayTime);
    }

    async show (currentServiceRole){
        let {metadataServerIPs = [], storageServerIPs = []} = this.props;
        this.setState({
            visible: true,
            formSubmitting: false,
            metadataServerIPs,
            storageServerIPs,
            currentServiceRole,
            currentServiceIP: '',
            currentServiceIPValidation: {status: '', help: '', valid: false},
            enableCustomRAID: false,
        });
        httpRequests.getClusterServiceAndClientIPs();
    }

    hide (){
        this.setState({visible: false,});
        this.clearConfigs();
        if (!this.state.enableCustomRAID){
            this.recommendedRAIDWrapper.getWrappedInstance().clearRAIDConf();
        } else {
            this.customRAIDForServiceWrapper.getWrappedInstance().clearRAIDConf();
        }
    }

    render (){
        let {visible, formSubmitting, currentServiceRole, currentServiceIPValidation, enableCustomRAID} = this.state;
        let serviceRoleMap = {
            metadata: lang('元数据服务', 'Metadata Service'),
            storage: lang('存储服务', 'Storage Service')
        };
        return (
            <Modal
                title={lang(`创建${serviceRoleMap[currentServiceRole]}`, `Create ${serviceRoleMap[currentServiceRole]}`)}
                width={1248}
                closable={false}
                maskClosable={false}
                visible={visible}
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
                            loading={formSubmitting}
                            onClick={this.create.bind(this)}
                        >
                            {lang('创建', 'Create')}
                        </Button>
                    </div>
                }
            >
                <div className="fs-target-create-wrapper">
                    <div className="fs-target-create-tip">
                        {lang(
                            '我们会按照您输入的节点IP，以及该节点剩下的可用磁盘，推荐给您一个RAID配置。您可以使用该配置创建RAID和存储目标。如果您是专业人士您也可以自定义它们。',
                            'We will give you a recommended RAid configuration depend on the node IP and the remaining node disks. It can be used for creating RAID and storage targets. If you are a professional you can custom them.'
                        )}
                    </div>
                    <div className="fs-target-create-node-service-select">
                        {/*
                        <span>{lang('服务角色:', 'Service Role:')}</span>
                        <span>{serviceRoleMap[currentServiceRole]}</span>
                        */}
                        <span>{lang('服务所在节点的IP:', 'IP Of The Node Of Service:')}</span>
                        <Form.Item
                            style={{display: 'inline-block'}}
                            validateStatus={this.state.currentServiceIPValidation.status}
                        >
                            <Input
                                style={{width: 175}}
                                size="small"
                                placeholder={lang('请输入服务所在节点的IP', 'Please enter IP of the node of service')}
                                value={this.state.currentServiceIP}
                                onChange={({target: {value}}) => this.serviceIPChange.bind(this, value)()}
                                onBlur={({target: {value}}) => !!value && this.getRAIDRecommendedConfiguration.bind(this, value)()}
                            />
                        </Form.Item>
                        {
                            !currentServiceIPValidation.valid &&
                                <span style={{marginLeft: 10, color: '#f5222d'}}>{currentServiceIPValidation.help}</span>
                        }
                        <Popover
                            placement="right"
                            content={lang('将在IP输入完后自动获取RAID推荐配置', 'Will get recommended RAID configuration after IP entering')}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-l" />
                        </Popover>
                    </div>
                    {
                        !enableCustomRAID ? <RecommendedRAID
                            notInit
                            ref={ref => this.recommendedRAIDWrapper = ref}
                            enableCustomRAID={this.enableCustomRAID.bind(this)}
                        /> :
                        <CustomRAIDForService
                            ref={ref => this.customRAIDForServiceWrapper = ref}
                            noRAIDRecommendedConfiguration={this.state.noRAIDRecommendedConfiguration}
                            enableRecommendedRAID={this.enableRecommendedRAID.bind(this)}
                        />
                    }
                </div>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, initialize: {recommendedRAID}, main: {dashboard: {clusterServiceAndClientIPs: {metadataServerIPs, storageServerIPs}, customRAIDList}}} = state;
    return {language, recommendedRAID, metadataServerIPs, storageServerIPs, customRAIDList};
};

const mapDispatchToProps = dispatch => {
    return {
        setRecommendedRAID: recommendedRAID => dispatch(initializeAction.setRecommendedRAID(recommendedRAID)),
        setCustomRAIDList: customRAIDList => dispatch(dashboardAction.setCustomRAIDList(customRAIDList)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateMetadataOrStorageService);