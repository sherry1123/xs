import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import routerPath from '../routerPath';

// bar
import TopBar from '../Bar/TopBar';
import SideBar from '../Bar/SideBar';

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
    render (){
        const Main = routerPath.Main;
        return (
            <div className="fs-main-wrapper">
                <TopBar history={this.props.history} />
                <div className='fs-body-wrapper'>
                    <SideBar history={this.props.history} />
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
            </div>
        );
    }
}