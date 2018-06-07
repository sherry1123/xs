import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import lang from '../../components/Language/lang';
import httpRequests from '../../http/requests';

class ServiceAndClient extends Component {
    componentDidMount (){
        httpRequests.getClusterServiceRoleIPs();
    }

    createMetadataService (){

    }

    createStorageService (){

    }

    createManagementService (){

    }

    createClient (){

    }

    render () {
        let {metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs} = this.props;
        return (
            <section className="fs-page-content">
                <section className="fs-service-and-client-wrapper">
                    <div className="fs-service-and-client-content">
                        <header className="fs-service-and-client-title">
                            <Icon type="profile" />{lang('元数据服务', 'Metadata Service')}
                            <Icon type="plus" onClick={this.createMetadataService.bind(this)} />
                        </header>
                        <div>
                            {
                                metadataServerIPs.map(ip => <div className="fs-service-and-client-item" key={ip}>{ip}</div>)
                            }
                        </div>
                    </div>
                    <div className="fs-service-and-client-content">
                        <header className="fs-service-and-client-title">
                            <Icon type="hdd" />{lang('存储服务', 'Storage Service')}
                            <Icon type="plus" onClick={this.createStorageService.bind(this)} />
                        </header>
                        <div>
                            {
                                storageServerIPs.map(ip => <div className="fs-service-and-client-item" key={ip}>{ip}</div>)
                            }
                        </div>
                    </div>
                    <div className="fs-service-and-client-content">
                        <header className="fs-service-and-client-title">
                            <Icon type="profile" />{lang('管理服务', 'Management Service')}
                            <Icon type="plus" onClick={this.createManagementService.bind(this)} />
                        </header>
                        <div>
                            {
                                managementServerIPs.map(ip => <div className="fs-service-and-client-item" key={ip}>{ip}</div>)
                            }
                        </div>
                    </div>
                    <div className="fs-service-and-client-content">
                        <header className="fs-service-and-client-title">
                            <Icon type="profile" />{lang('客户端', 'Client')}
                            <Icon type="plus" onClick={this.createClient.bind(this)} />
                        </header>
                        <div>
                            {
                                clientIPs.map(ip => <div className="fs-service-and-client-item" key={ip}>{ip}</div>)
                            }
                        </div>
                    </div>
                </section>
            </section>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterServiceRoleIPs: {metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs}}}} = state;
    return {language, metadataServerIPs, storageServerIPs, managementServerIPs, clientIPs};
};

export default connect(mapStateToProps)(ServiceAndClient);
