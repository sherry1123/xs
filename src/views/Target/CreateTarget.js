import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, message, Modal, Select} from 'antd';
import RecommendedRAID from '../../components/DiskConfiguration/RecommendedRAID';
import CustomRAID from '../../components/DiskConfiguration/CustomRAID';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';
import initializeAction from '../../redux/actions/initializeAction';

class CreateTarget extends Component {
    constructor (props){
        super(props);
        let {metadataServerIPs = [], storageServerIPs = []} = this.props;
        this.state = {
            visible: false,
            formSubmitting: false,
            metadataServerIPs,
            storageServerIPs,
            currentServiceRole: 'storage',
            currentServiceIPList: storageServerIPs,
            currentServiceIP: '',
            enableCustomRAID: false,
        };
    }

    componentWillReceiveProps (nextProps){
        let {metadataServerIPs = [], storageServerIPs = []} = nextProps;
        let {currentServiceRole} = this.state;
        let currentServiceIPList = currentServiceRole === 'metadata' ? metadataServerIPs : storageServerIPs;
        this.setState({
            metadataServerIPs,
            storageServerIPs,
            currentServiceIPList,
        });
    }

    /*
    serviceRoleChange (currentServiceRole){
        this.setState({currentServiceRole});
    }
    */

    serviceIPChange (currentServiceIP, option){
        this.setState({currentServiceIP});
        let currentServiceNode = Object.assign({}, option.props.option, {type: 'storage'});
        if (!this.state.enableCustomRAID){
            httpRequests.getRecommendedRIAD.apply(null, this.state.currentServiceRole === 'metadata' ? [[currentServiceIP], []] : [[], [currentServiceIP]]);
            this.recommendedRAIDWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
        } else {
            this.customRAIDWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
        }
    }

    async enableCustomRAID (){
        // switch to custom RAID mode
        let {currentServiceIP} = this.state;
        let i = this.findIPIndexInList(currentServiceIP);
        let currentServiceNode = {
            type: 'storage',
            ip: currentServiceIP,
            i,
        };
        await this.setState({
            enableCustomRAID: true,
            currentServiceType: 'storage',
            currentServiceNode,
        });
        this.customRAIDWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
    }

    async enableRecommendedRAID (){
        // switch to recommended RAID mode
        let {currentServiceIP} = this.state;
        let i = this.findIPIndexInList(currentServiceIP);
        let currentServiceNode = {
            type: 'storage',
            ip: currentServiceIP,
            i,
        };
        await this.setState({
            enableCustomRAID: false,
            currentServiceType: 'storage',
            currentServiceNode,
        });
        this.recommendedRAIDWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
        httpRequests.getRecommendedRIAD.apply(null, this.state.currentServiceRole === 'metadata' ? [[this.state.currentServiceIP], []] : [[], [this.state.currentServiceIP]]);
    }

    checkCustomRAID (){

        // Only need to check storage services, if no RAID conf has selectedDisks, it means this no custom RAID conf
        let {currentServiceRole} = this.state;
        let {customRAID} = this.props;
        let currentServiceRoleCustomRAID = customRAID[currentServiceRole + 'Nodes'];
        let isCheckOK = !currentServiceRoleCustomRAID.reduce((prev, curr) => prev && curr.raidList.every(raid => !raid.selectedDisks.length), true);
        // console.info(currentCustomRAID, isCheckOK);
        return isCheckOK;
    }

    findIPIndexInList (currentServiceIP){
        return this.state.currentServiceIPList.findIndex(ip => ip === currentServiceIP);
    }

    async create (){
        if (this.state.enableCustomRAID && !this.checkCustomRAID()){
            return message.warning(lang(
                '您已开始自定义RAID配置，请为该服务节点正确配置RAID，否则请选择使用推荐RAID配置。',
                'You have enabled custom RAID configuration, please configure the RAID correctly for this service node. Otherwise please select the recommended RAID configuration.')
            );
        }
        let {recommendedRAID, customRAID} = this.props;
        let RAIDConf = [];
        if (!this.state.enableCustomRAID){
            RAIDConf = recommendedRAID;
            RAIDConf['enableCustomRAID'] = false;
            // console.info(RAIDConf);
        } else {
            // only need the nodes which has valid RAID conf, should drop the RAIDConf which has no selectedDisks in ,
            // raidList, and drop the node which has no raid in raidList
            RAIDConf = customRAID[this.state.currentServiceRole + 'Nodes'].map(node => {
                node.raidList = node.raidList.filter(raid => !!raid.selectedDisks.length);
                return node;
            }).filter(node => !!node.raidList.length);
            RAIDConf = {storageServerIPs: RAIDConf};
            RAIDConf['enableCustomRAID'] = true;
            // console.info(RAIDConf);
        }
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createTarget(RAIDConf);
            httpRequests.getTargetList();
            await this.hide();
            this.clearConfigs();
            if (!this.state.enableCustomRAID){
                this.recommendedRAIDWrapper.getWrappedInstance().clearRAIDConf();
            }
            message.success(lang(`创建存储目标成功!`, `Create storage target(s) successfully!`));
        } catch ({msg}){
            message.error(lang(`创建存储目标失败, 原因: `, `Create storage target(s) failed, reason: `) + msg);
        }
        this.setState({formSubmitting: false});
    }

    clearConfigs (delayTime = 500){
        // clear configs in redux
        setTimeout(() => {
            let {setRecommendedRAID, setCustomRAID} = this.props;
            setRecommendedRAID({metadataServerIPs: {}, storageServerIPs: {}});
            setCustomRAID([]);
        }, delayTime);
    }

    async show (){
        let {metadataServerIPs = [], storageServerIPs = []} = this.props;
        this.setState({
            visible: true,
            formSubmitting: false,
            metadataServerIPs,
            storageServerIPs,
            currentServiceRole: 'storage',
            currentServiceIPList: storageServerIPs,
            currentServiceIP: '',
            enableCustomRAID: false,
        });
        // httpRequests.getRecommendedRIAD([], [storageServerIPs[0]]);
    }

    hide (){
        this.setState({visible: false,});
        this.clearConfigs();
        if (!this.state.enableCustomRAID){
            this.recommendedRAIDWrapper.getWrappedInstance().clearRAIDConf();
        }
    }

    render (){
        let {visible, formSubmitting, currentServiceIPList, enableCustomRAID} = this.state;
        return (
            <Modal
                title={lang(`创建存储目标`, `Create Storage Target`)}
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
                            '我们会按照您选择的服务角色和节点IP，以及该节点剩下的可用磁盘，推荐给您一个RAID配置。您可以使用该配置创建RAID和存储目标。如果您是专业人士您也可以自定义它们。',
                            'We will give you a recommended RAid configuration depend on the service role, node IP and node disks. It can be used for creating RAID and storage targets. If you are a professional you can custom them.'
                        )}
                    </div>
                    <div className="fs-target-create-node-service-select">
                        <span>{lang('服务角色:', 'Service Role:')}</span>
                        <span>{lang('存储服务' , 'Storage Service')}</span>
                        {/*
                        // currently, we can only create targets on storage services
                        <Select
                            size="small"
                            style={{width: 100, marginRight: 15}}
                            value={this.state.currentServiceRole}
                            onChange={this.serviceRoleChange.bind(this)}
                        >
                            <Select.Option value="metadata">{lang('元数据服务', 'Metadata')}</Select.Option>
                            <Select.Option value="storage">{lang('存储服务', 'Storage')}</Select.Option>
                        </Select>
                        */}
                        <span>{lang('节点:', 'Node:')}</span>
                        <Select
                            style={{width: 125}}
                            size="small"
                            value={this.state.currentServiceIP}
                            onChange={this.serviceIPChange.bind(this)}
                        >
                            {
                                currentServiceIPList.map((ip, i) => <Select.Option key={i} value={ip} option={{ip, i}}>{ip}</Select.Option>)
                            }
                        </Select>
                    </div>
                    {
                        !enableCustomRAID ? <RecommendedRAID
                            notInit
                            ref={ref => this.recommendedRAIDWrapper = ref}
                            enableCustomRAID={this.enableCustomRAID.bind(this)}
                        /> :
                        <CustomRAID
                            notInit
                            ref={ref => this.customRAIDWrapper = ref}
                            enableRecommendedRAID={this.enableRecommendedRAID.bind(this)}
                        />
                    }
                </div>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, initialize: {recommendedRAID, customRAID}, main: {dashboard: {clusterPhysicalNodeList, clusterServiceAndClientIPs: {metadataServerIPs, storageServerIPs}}}} = state;
    return {language, recommendedRAID, customRAID, clusterPhysicalNodeList, metadataServerIPs, storageServerIPs};
};

const mapDispatchToProps = dispatch => {
    return {
        setRecommendedRAID: recommendedRAID => dispatch(initializeAction.setRecommendedRAID(recommendedRAID)),
        setCustomRAID: customRAID => dispatch(initializeAction.setCustomRAID(customRAID)),
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateTarget);