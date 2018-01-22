import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import Cookie from 'js-cookie';
import routerPath from '../routerPath';

// bar
import TopBar from '../Bar/TopBar';
import SideBar from '../Bar/SideBar';
import FooterBar from '../Bar/FooterBar';

// metadata nodes
import MetadataNodesOverview from '../MetadataNodes/MetadataNodesOverview';
import MetadataNodesDetail from '../MetadataNodes/MetadataNodesDetail';

// storage nodes
import StorageNodesOverview from '../StorageNodes/StorageNodesOverview';
import StorageNodesDetail from '../StorageNodes/StorageNodesDetail';

// client statistics metadata
import ClientStatisticsMetadata from '../ClientStatistics/ClientStatisticsMetadata';
import ClientStatisticsStorage from '../ClientStatistics/ClientStatisticsStorage';

// user statistics metadata
import UserStatisticsMetadata from '../UserStatistics/UserStatisticsMetadata';
import UserStatisticsStorage from '../UserStatistics/UserStatisticsStorage';

// user statistics metadata
import ManagementKnownProblems from '../Management/ManagementKnownProblems';
import ManagementLogFile from '../Management/ManagementLogFile';

// user statistics metadata
import FSOperationStripeSettings from '../FSOperation/FSOperationStripeSettings';
import FSOperationFileBrowser from '../FSOperation/FSOperationFileBrowser';

export default class Main extends Component {
    componentWillMount (){
        let isInitialized = Cookie.get('init');
        if (isInitialized === 'true'){
            let isLoggedIn = Cookie.get('user');
            if (!isLoggedIn || (isLoggedIn === 'false')){
                this.props.history.replace(routerPath.Login);
            }
        } else {
            this.props.history.replace(routerPath.Init);
        }
    }

    componentDidMount (){
        let prevScrollTop = 0;
        let prevDirection = 'down';
        this.scrollHandler = ({target: {scrollingElement: {scrollTop}}}) => {
            let direction = scrollTop - prevScrollTop > 0 ? 'up' : 'down';
            prevScrollTop = scrollTop;
            if (direction !== prevDirection){
                prevDirection = direction;
                this.TopBar.getWrappedInstance().switchScrollDirection(direction);
                this.SideBar.getWrappedInstance().switchScrollDirection(direction);
            }
        };
        window.addEventListener('scroll', this.scrollHandler);
    }

    componentWillUnmount (){
        window.removeEventListener('scroll', this.scrollHandler);
    }

    render (){
        const Main = routerPath.Main;
        return (
            <div className="fs-main-wrapper">
                <TopBar history={this.props.history} ref={ref => this.TopBar = ref} />
                <div className="fs-body-wrapper">
                    <SideBar history={this.props.history} ref={ref => this.SideBar = ref} />
                    <main className='fs-page-wrapper'>
                        <Route path={`${Main}${routerPath.MetadataNodesOverview}`} component={MetadataNodesOverview} />
                        <Route path={`${Main}${routerPath.MetadataNodesDetail}`} component={MetadataNodesDetail} />

                        <Route path={`${Main}${routerPath.StorageNodesOverview}`} component={StorageNodesOverview} />
                        <Route path={`${Main}${routerPath.StorageNodesDetail}`} component={StorageNodesDetail} />

                        <Route path={`${Main}${routerPath.ClientStatisticsMetadata}`} component={ClientStatisticsMetadata} />
                        <Route path={`${Main}${routerPath.ClientStatisticsStorage}`} component={ClientStatisticsStorage} />

                        <Route path={`${Main}${routerPath.UserStatisticsMetadata}`} component={UserStatisticsMetadata} />
                        <Route path={`${Main}${routerPath.UserStatisticsStorage}`} component={UserStatisticsStorage} />

                        <Route path={`${Main}${routerPath.ManagementKnownProblems}`} component={ManagementKnownProblems} />
                        <Route path={`${Main}${routerPath.ManagementLogFile}`} component={ManagementLogFile} />

                        <Route path={`${Main}${routerPath.FSOperationStripeSettings}`} component={FSOperationStripeSettings} />
                        <Route path={`${Main}${routerPath.FSOperationFileBrowser}`} component={FSOperationFileBrowser} />
                    </main>
                </div>
                <FooterBar />
            </div>
        );
    }
}