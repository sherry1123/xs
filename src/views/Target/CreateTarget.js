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
            currentServiceIP: storageServerIPs[0] || '',
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
            currentServiceIP: currentServiceIPList[0]
        });
    }

    /*
    serviceRoleChange (currentServiceRole){
        this.setState({currentServiceRole});
    }
    */

    serviceIPChange (currentServiceIP){
        let metadataServerIPs = [];
        let storageServerIPs = [];
        if (this.state.currentServiceRole === 'metadata'){
            metadataServerIPs = [currentServiceIP];
        } else {
            storageServerIPs = [currentServiceIP];
        }
        httpRequests.getRecommendedRIAD(metadataServerIPs, storageServerIPs);
        this.setState({currentServiceIP});
    }

    enableCustomRAID (){
        // switch to custom RAID mode
        let currentServiceNode = {
            type: 'metadata',
            ip: this.props.metadataServerIPs[0], // the first one
        };
        this.setState({
            enableCustomRAID: true,
            currentServiceType: 'metadata',
            currentServiceNode,
        });
    }

    async enableRecommendedRAID (){
        // switch to recommended RAID mode
        let currentServiceNode = {
            type: 'metadata',
            ip: this.props.metadataServerIPs[0], // the first one
        };
        await this.setState({
            enableCustomRAID: false,
            currentServiceType: 'metadata',
            currentServiceNode,
        });
        this.recommendedRAIDWrapper.getWrappedInstance().changeServiceIP(currentServiceNode);
    }


    async create (){
        let {recommendedRAID, customRAID} = this.props;
        let RAIDConf = this.state.enableCustomRAID ? customRAID : recommendedRAID;
        this.setState({formSubmitting: true});
        try {
            await httpRequests.createTarget(RAIDConf);
            httpRequests.getTargetList();
            await this.hide();
            this.clearConfigs();
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
            setRecommendedRAID([]);
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
            currentServiceIP: storageServerIPs[0] || '',
            enableCustomRAID: false,
        });
        httpRequests.getClusterServiceAndClientIPs();
    }

    hide (){
        this.setState({visible: false,});
        this.clearConfigs();
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
                                currentServiceIPList.map((ip, i) => <Select.Option key={i} value={ip}>{ip}</Select.Option>)
                            }
                        </Select>
                    </div>
                    {
                        !enableCustomRAID?
                            <RecommendedRAID
                                notInit
                                ref={ref => this.recommendedRAIDWrapper = ref}
                                enableCustomRAID={this.enableCustomRAID.bind(this)}
                            /> :
                            <CustomRAID
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