import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import Cookie from 'js-cookie';
import routerPath from '../routerPath';

// bar
import TopBar from '../Bar/TopBar';
import SideBar from '../Bar/SideBar';
import FooterBar from '../Bar/FooterBar';

// metadata nodes
import MetadataNodes from '../MetadataNodes/MetadataNodes';

// storage nodes
import StorageNodes from '../StorageNodes/StorageNodes';

// client statistics metadata
import ClientStatistics from '../ClientStatistics/ClientStatistics';

// user statistics metadata
import UserStatistics from '../UserStatistics/UserStatistics';

// snapshot
import Snapshot from '../Snapshot/Snapshot';

// management
// import ManagementKnownProblems from '../Management/ManagementKnownProblems';
import ManagementSystemLog from '../Management/ManagementSystemLog';

// fs operation
// import FSOperationStripeSettings from '../FSOperation/FSOperationStripeSettings';
// import FSOperationFileBrowser from '../FSOperation/FSOperationFileBrowser';
import FSOperation from '../FSOperation/FSOperation';

// dashboard
// import Dashboard from '../Dashboard/Dashboard';

export default class Main extends Component {
    componentWillMount (){
        let isInitialized = Cookie.get('init');
        if (isInitialized === 'true'){
            let isLoggedIn = Cookie.get('login');
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