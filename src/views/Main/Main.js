import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import asyncLoad from '../asyncLoad';
import {ckGet} from '../../services';
import routerPath from '../routerPath';

// bar
import TopBar from '../Bar/TopBar';
import SideBar from '../Bar/SideBar';

// dashboard
const Dashboard = asyncLoad(() => import('../Dashboard/Dashboard'));

// metadata nodes
// const MetadataNodes = asyncLoad(() => import('../MetadataNodes/MetadataNodes'));

// storage nodes
const StorageNodes = asyncLoad(() => import('../StorageNodes/StorageNodes'));

// client statistics metadata
// const ClientStatistics = asyncLoad(() => import('../ClientStatistics/ClientStatistics'));

// user statistics metadata
// const UserStatistics = asyncLoad(() => import('../UserStatistics/UserStatistics'));

// snapshot
const Snapshot = asyncLoad(() => import('../Snapshot/Snapshot'));
const SnapshotSchedule = asyncLoad(() => import('../SnapshotSchedule/SnapshotSchedule'));

// share
const NFS = asyncLoad(() => import('../NFS/NFS'));
const CIFS = asyncLoad(() => import('../CIFS/CIFS'));

// local authentication user and group
const LocalAuthUser = asyncLoad(() => import('../LocalAuthUser/LocalAuthUser'));
const LocalAuthUserGroup = asyncLoad(() => import('../LocalAuthUserGroup/LocalAuthUserGroup'));

// management
const ManagementSystemLog = asyncLoad(() => import('../Management/ManagementSystemLog'));

// fs operation
const FSOperation = asyncLoad(() => import('../FSOperation/FSOperation'));

// test
const Test = asyncLoad(() => import('../Test/Test'));

export default class Main extends Component {
    componentWillMount (){
        // see router interceptor rule in routerPath.js
        let isDeInit = ckGet('deInit');
        let isInitialized = ckGet('init');
        if (isDeInit === 'true' && isInitialized === 'true'){
            this.props.history.replace(routerPath.DeInitializing);
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

    componentDidMount (){
        /*
        let prevScrollTop = 0;
        let threshold = 30;
        let prevDirection = 'down';
        this.scrollHandler = ({target: {scrollingElement: {scrollTop}}}) => {
            let dif = scrollTop - prevScrollTop;
            let direction = '';
            if (dif > threshold){
                direction = 'up'
            } else if (dif < 0){
                direction = 'down';
            }
            // prevScrollTop = scrollTop;
            if (direction !== prevDirection){
                prevDirection = direction;
                this.TopBar.getWrappedInstance().switchScrollDirection(direction);
                // this.SideBar.getWrappedInstance().switchScrollDirection(direction);
            }
        };
        window.addEventListener('scroll', this.scrollHandler, {passive: true});
        */
    }

    componentWillUnmount (){
        // window.removeEventListener('scroll', this.scrollHandler, {passive: true});
    }

    render (){
        const Main = routerPath.Main;
        return (
            <div className="fs-main-wrapper">
                <SideBar />
                <div className="fs-body-wrapper">
                    <TopBar ref={ref => this.TopBar = ref} />
                    <main className='fs-content-wrapper'>
                        <Route path={`${Main}${routerPath.Dashboard}`} component={Dashboard} />
                        {/*<Route path={`${Main}${routerPath.MetadataNodes}`} component={MetadataNodes} />*/}
                        <Route path={`${Main}${routerPath.StorageNodes}`} component={StorageNodes} />
                        {/*<Route path={`${Main}${routerPath.ClientStatistics}`} component={ClientStatistics} />*/}
                        {/*<Route path={`${Main}${routerPath.UserStatistics}`} component={UserStatistics} />*/}
                        <Route path={`${Main}${routerPath.Snapshot}`} component={Snapshot} />
                        <Route path={`${Main}${routerPath.SnapshotSchedule}`} component={SnapshotSchedule} />
                        <Route path={`${Main}${routerPath.NFS}`} component={NFS} />
                        <Route path={`${Main}${routerPath.CIFS}`} component={CIFS} />
                        <Route path={`${Main}${routerPath.LocalAuthUser}`} component={LocalAuthUser} />
                        <Route path={`${Main}${routerPath.LocalAuthUserGroup}`} component={LocalAuthUserGroup} />
                        <Route path={`${Main}${routerPath.ManagementSystemLog}`} component={ManagementSystemLog} />
                        <Route path={`${Main}${routerPath.FSOperation}`} component={FSOperation} />
                        <Route path={`${Main}${routerPath.Test}`} component={Test} />
                    </main>
                </div>
            </div>
        );
    }
}