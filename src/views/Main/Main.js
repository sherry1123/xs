import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import asyncLoad from '../asyncLoad';
import {ckGet} from '../../services';
import routerPath from '../routerPath';

// bar
import TopBar from '../Bar/TopBar';
import SideBar from '../Bar/SideBar';
import FooterBar from '../Bar/FooterBar';

// metadata nodes
const MetadataNodes = asyncLoad(() => import('../MetadataNodes/MetadataNodes'));

// storage nodes
const StorageNodes = asyncLoad(() => import('../StorageNodes/StorageNodes'));

// client statistics metadata
const ClientStatistics = asyncLoad(() => import('../ClientStatistics/ClientStatistics'));

// user statistics metadata
const UserStatistics = asyncLoad(() => import('../UserStatistics/UserStatistics'));

// snapshot
const Snapshot = asyncLoad(() => import('../Snapshot/Snapshot'));
const SnapshotSchedule = asyncLoad(() => import('../SnapshotSchedule/SnapshotSchedule'));

// Share
const Share = asyncLoad(() => import('../Share/Share'));

// management
const ManagementSystemLog = asyncLoad(() => import('../Management/ManagementSystemLog'));

// fs operation
const FSOperation = asyncLoad(() => import('../FSOperation/FSOperation'));

// dashboard
// const Dashboard = asyncLoad(() => import('../Dashboard/Dashboard'));

export default class Main extends Component {
    componentWillMount (){
        let isInitialized = ckGet('init');
        if (isInitialized === 'true'){
            let isLoggedIn = ckGet('login');
            if (!isLoggedIn || (isLoggedIn === 'false')){
                this.props.history.replace(routerPath.Login);
            }
        } else {
            this.props.history.replace(routerPath.Init);
        }
    }

    componentDidMount (){
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
                this.SideBar.getWrappedInstance().switchScrollDirection(direction);
            }
        };
        window.addEventListener('scroll', this.scrollHandler, {passive: true});
    }

    componentWillUnmount (){
        window.removeEventListener('scroll', this.scrollHandler, {passive: true});
    }

    render (){
        const Main = routerPath.Main;
        return (
            <div className="fs-main-wrapper">
                <TopBar history={this.props.history} ref={ref => this.TopBar = ref} />
                <div className="fs-body-wrapper">
                    <SideBar history={this.props.history} ref={ref => this.SideBar = ref} />
                    <main className='fs-content-wrapper'>
                        <Route path={`${Main}${routerPath.MetadataNodes}`} component={MetadataNodes} />

                        <Route path={`${Main}${routerPath.StorageNodes}`} component={StorageNodes} />

                        <Route path={`${Main}${routerPath.ClientStatistics}`} component={ClientStatistics} />

                        <Route path={`${Main}${routerPath.UserStatistics}`} component={UserStatistics} />

                        <Route path={`${Main}${routerPath.Snapshot}`} component={Snapshot} />

                        <Route path={`${Main}${routerPath.SnapshotSchedule}`} component={SnapshotSchedule} />

                        <Route path={`${Main}${routerPath.Share}`} component={Share} />

                        {/*
                        <Route path={`${Main}${routerPath.ManagementKnownProblems}`} component={ManagementKnownProblems} />
                        */}
                        <Route path={`${Main}${routerPath.ManagementSystemLog}`} component={ManagementSystemLog} />

                        {/*
                        <Route path={`${Main}${routerPath.FSOperationStripeSettings}`} component={FSOperationStripeSettings} />
                        <Route path={`${Main}${routerPath.FSOperationFileBrowser}`} component={FSOperationFileBrowser} />
                        */}
                        <Route path={`${Main}${routerPath.FSOperation}`} component={FSOperation} />

                        {/*
                        <Route path={`${Main}${routerPath.Dashboard}`} component={Dashboard} />
                        */}
                    </main>
                </div>
                <FooterBar />
            </div>
        );
    }
}