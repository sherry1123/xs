import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import asyncLoad from '../asyncLoad';
import {ckGet} from 'Services';
import routerPath from '../routerPath';

// bar
import TopBar from '../Bar/TopBar';
import SideBar from '../Bar/SideBar';

// dashboard
const Dashboard = asyncLoad(() => import('../Dashboard/Dashboard'));

// data node
const DataNode = asyncLoad(() => import('../DataNode/DataNode'));

// storage pool
const StoragePool = asyncLoad(() => import('../StoragePool/StoragePool'));

// snapshot
// const Snapshot = asyncLoad(() => import('../Snapshot/Snapshot'));
// const SnapshotSchedule = asyncLoad(() => import('../SnapshotSchedule/SnapshotSchedule'));

// share
const NASServer = asyncLoad(() => import('../NASServer/NASServer'));
const NFS = asyncLoad(() => import('../NFS/NFS'));
const CIFS = asyncLoad(() => import('../CIFS/CIFS'));

// local authentication user and group
const LocalAuthUser = asyncLoad(() => import('../LocalAuthUser/LocalAuthUser'));
const LocalAuthUserGroup = asyncLoad(() => import('../LocalAuthUserGroup/LocalAuthUserGroup'));

// service and client
const ServiceAndClient = asyncLoad(() => import('../ServiceAndClient/ServiceAndClient'));

// storage target and buddy group
const Target  = asyncLoad(() => import('../Target/Target'));
const BuddyGroup  = asyncLoad(() => import('../BuddyGroup/BuddyGroup'));

// system log
const SystemLog = asyncLoad(() => import('../SystemLog/SystemLog'));

// fs operation
const FSOperation = asyncLoad(() => import('../FSOperation/FSOperation'));

// system log
const SystemLog = asyncLoad(() => import('../SystemLog/SystemLog'));

// data check and recover
const DataChecking = asyncLoad(() => import('../DataChecking/DataChecking'));

// System parameter configuration
const SystemConfiguration = asyncLoad(() => import('../SystemConfiguration/SystemConfiguration'));

export default class Main extends Component {
    componentWillMount (){
        // see router interceptor rule in routerPath.js
        let isDeInit = ckGet('deinit');
        let isReInit = ckGet('reinit');
        let isInitialized = ckGet('init');
        if (isDeInit === 'true' && isInitialized === 'true'){
            this.props.history.replace(routerPath.DeInitializing);
        } else if (isReInit === 'true' && isInitialized === 'true'){
            this.props.history.replace(routerPath.ReInitializing);
        } else {
            let isRollingBack = ckGet('rollbacking');
            if (isRollingBack === 'true' && isInitialized === 'true'){
                this.props.history.replace(routerPath.RollingBack);
            } else {
                if (isInitialized === 'true'){
                    let isLoggedIn = ckGet('login');
                    if (!isLoggedIn || (isLoggedIn === 'false')){
                        this.props.history.replace(routerPath.Login);
                    }
                } else {
                    this.props.history.replace(routerPath.Init);
                }
            }
        }
    }

    render (){
        const Main = routerPath.Main;
        return (
            <div className="fs-body-wrapper">
                <SideBar />
                <div className="fs-main-wrapper">
                    <TopBar />
                    <main className='fs-content-wrapper'>
                        <Route path={`${Main}${routerPath.Dashboard}`} component={Dashboard} />

                        <Route path={`${Main}${routerPath.DataNode}`} component={DataNode} />

                        <Route path={`${Main}${routerPath.ServiceAndClient}`} component={ServiceAndClient} />

						<Route path={`${Main}${routerPath.StoragePool}`} component={StoragePool} />

                        {/*
                        <Route path={`${Main}${routerPath.Snapshot}`} component={Snapshot} />

                        <Route path={`${Main}${routerPath.SnapshotSchedule}`} component={SnapshotSchedule} />
                        */}

                        <Route path={`${Main}${routerPath.NASServer}`} component={NASServer} />

                        <Route path={`${Main}${routerPath.NFS}`} component={NFS} />

                        <Route path={`${Main}${routerPath.CIFS}`} component={CIFS} />

                        <Route path={`${Main}${routerPath.LocalAuthUser}`} component={LocalAuthUser} />

                        <Route path={`${Main}${routerPath.LocalAuthUserGroup}`} component={LocalAuthUserGroup} />

                        <Route path={`${Main}${routerPath.Target}`} component={Target} />

                        <Route path={`${Main}${routerPath.BuddyGroup}`} component={BuddyGroup} />

                        <Route path={`${Main}${routerPath.FSOperation}`} component={FSOperation} />

                        <Route path={`${Main}${routerPath.SystemLog}`} component={SystemLog} />

                        <Route path={`${Main}${routerPath.DataChecking}`} component={DataChecking} />

                        <Route path={`${Main}${routerPath.SystemConfiguration}`} component={SystemConfiguration} />
                    </main>
                </div>
            </div>
        );
    }
}