import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon, message} from 'antd';
import CreateClient from './CreateClient';
import CreateManagementService from './CreateManagementService';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';

class ServiceAndClient extends Component {
    componentDidMount (){
        httpRequests.getClusterServiceAndClientIPs();
    }

    createMetadataService (){

    }

    createStorageService (){

    }

    createManagementService (){
        let {managementServerIPs} = this.props;
        // Management service creation policy:
        // 1. If there is already a existing management service, prompt user that create a new one should
        //    enable the HA feature, and a additional float IP and two heartbeat IPs are demanded.
        // 2. If there are already two management services existing, should not create any more.
        if (managementServerIPs.length >= 2){
            return message.warning(lang('当前已有2个管理服务，不能再创建了。', 'There are already two management services existing, can not create any more.'));
        }
        if (managementServerIPs.length >= 1){
            return this.createManagementServiceWrapper.getWrappedInstance().show();
        }
    }


    createClient (){
        this.createClientWrapper.getWrappedInstance().show();
    }

    render () {
        let {metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs} = this.props;
        return (
            <section className="fs-page-content">
                <div className="fs-table-operation-wrapper">
                    <div className="fs-operation-info-box">
                        <div className="fs-operation-info-item">
                            <div className="fs-operation-info-item-value light-green">
                                {metadataServerIPs.length}
                            </div>
                            <div className="fs-operation-info-item-label">
                                {lang('元数据服务', 'Metadata Service')}
                            </div>
                        </div>
                        <div className="fs-operation-info-item">
                            <div className="fs-operation-info-item-value orange">
                                {storageServerIPs.length}
                            </div>
                            <div className="fs-operation-info-item-label">
                                {lang('存储服务', 'Storage Service')}
                            </div>
                        </div>
                        <div className="fs-operation-info-item">
                            <div className="fs-operation-info-item-value light-blue">
                                {managementServerIPs.length}
                            </div>
                            <div className="fs-operation-info-item-label">
                                {lang('管理服务', 'Management Service')}
                            </div>
                        </div>
                        <div className="fs-operation-info-item">
                            <div className="fs-operation-info-item-value purple">
                                {clientIPs.length}
                            </div>
                            <div className="fs-operation-info-item-label">
                                {lang('客户端', 'Client Service')}
                            </div>
                        </div>
                    </div>
                </div>
                <section className="fs-service-and-client-wrapper">
                    <div className="fs-service-and-client-content">
                        <header className="fs-service-and-client-title">
                            <Icon type="profile" />{lang('元数据服务', 'Metadata Service')}
                            <Icon type="plus" onClick={this.createMetadataService.bind(this)} />
                        </header>
                        <div>{metadataServerIPs.map(ip => <div className="fs-service-and-client-item" key={ip}>{ip}</div>)}</div>
                    </div>
                    <div className="fs-service-and-client-content">
                        <header className="fs-service-and-client-title">
                            <Icon type="hdd" />{lang('存储服务', 'Storage Service')}
                            <Icon type="plus" onClick={this.createStorageService.bind(this)} />
                        </header>
                        <div>
                            {storageServerIPs.map(ip => <div className="fs-service-and-client-item" key={ip}>{ip}</div>)}
                        </div>
                    </div>
                    <div className="fs-service-and-client-content">
                        <header className="fs-service-and-client-title">
                            <Icon type="appstore-o" />{lang('管理服务', 'Management Service')}{managementServerIPs.length === 2 ? lang(' - 已开启HA', ' - HA Enabled') : ''}
                            {managementServerIPs.length < 2 && <Icon type="plus" onClick={this.createManagementService.bind(this)} />}
                        </header>
                        <div>{managementServerIPs.map(ip => <div className="fs-service-and-client-item" key={ip}>{ip}</div>)}</div>
                    </div>
                    <div className="fs-service-and-client-content">
                        <header className="fs-service-and-client-title">
                            <Icon type="laptop" />{lang('客户端', 'Client')}
                            <Icon type="plus" onClick={this.createClient.bind(this)} />
                        </header>
                        <div>{clientIPs.map(ip => <div className="fs-service-and-client-item" key={ip}>{ip}</div>)}</div>
                    </div>
                </section>
                <CreateClient ref={ref => this.createClientWrapper = ref} />
                <CreateManagementService ref={ref => this.createManagementServiceWrapper = ref} />
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterServiceAndClientIPs: {metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs}}}} = state;
    return {language, metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs};
};

export default connect(mapStateToProps)(ServiceAndClient);
