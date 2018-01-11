import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import routerPath from '../routerPath';

// bar
import TopBar from '../Bar/TopBar';
import SideBar from '../Bar/SideBar';

// metadata nodes
import MetadataNodesOverview from '../MetadataNodes/MetadataNodesOverview';
import MetadataNodesDetail from '../MetadataNodes/MetadataNodesDetail';

export default class Main extends Component {
    render (){
        const Main = routerPath.Main;
        return (
            <div className="fs-main-wrapper">
                <TopBar history={this.props.history} />
                <div className='fs-body-wrapper'>
                    <SideBar />
                    <main className='fs-page-wrapper'>
                        <Route path={`${Main}${routerPath.MetadataNodesOverview}`} component={MetadataNodesOverview} />
                        <Route path={`${Main}${routerPath.MetadataNodesDetail}`} component={MetadataNodesDetail} />
                    </main>
                </div>
            </div>
        );
    }
}