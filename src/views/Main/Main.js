import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import routerPath from '../routerPath';

// bar
import TopBar from '../Bar/TopBar';
import SideBar from '../Bar/SideBar';

// usr
import User from '../User/User';

export default class Main extends Component {
    render (){
        const Main = routerPath.Main;
        return (
            <div className="fs-main-wrapper">
                <TopBar history={this.props.history} />
                <div className='fs-body-wrapper'>
                    <SideBar />
                    <main className='fs-page-wrapper'>
                        <Route path={`${Main}${routerPath.User}`} component={User} />
                    </main>
                </div>
            </div>
        );
    }
}