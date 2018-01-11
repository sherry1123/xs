import React, {Component} from 'react';

export default class TopBar extends Component {
    render (){
        return (
            <header className="fs-top-bar-wrapper">
                <section className="logo-wrapper">
                    <a className="logo-link" >
                        <img alt="" src="../../images/logo.jpeg" />
                    </a>
                </section>
                <section className="login-user-wrapper">
                    <span>登录用户: 管理员</span>
                </section>
            </header>
        );
    }
}