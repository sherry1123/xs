import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Icon, message} from 'antd';
import CreateMetadataOrStorageService from './CreateMetadataOrStorageService';
import CreateManagementService from './CreateManagementService';
import CreateClient from './CreateClient';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterServiceAndClientIPs: {metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs}}}} = state;
    return {language, metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs};
};

@connect(mapStateToProps)
export default class ServiceAndClient extends Component {
    componentDidMount (){
        // will first fetch in cronJob immediately, but if the system is not inited, won't fetch,
        // so still needs to do a check here, if don't fetch in cron job when accessing web, should
        // fetch it here.
        let {metadataServerIPs} = this.props;
        if (!metadataServerIPs.length){
            httpRequests.getClusterServiceAndClientIPs();
        }
    }

    createMetadataService (){
        this.createMetadataOrStorageServiceWrapper.getWrappedInstance().show('metadata');
    }

    createStorageService (){
        this.createMetadataOrStorageServiceWrapper.getWrappedInstance().show('storage');
    }

    createManagementService (){
        let {managementServerIPs} = this.props;
        // Management service creation strategy:
        // 1. If there is already an existing management service, prompt user that create a new one should
        //    enable the HA feature, and an additional float IP and two heartbeat IPs are required.
        // 2. If there are already two management services existing, could not create any more.
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
                                {lang('客户端', 'Client')}
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
                <CreateMetadataOrStorageService ref={ref => this.createMetadataOrStorageServiceWrapper = ref} />
                <CreateManagementService ref={ref => this.createManagementServiceWrapper = ref} />
                <CreateClient ref={ref => this.createClientWrapper = ref} />
            </section>
        );
    }
}