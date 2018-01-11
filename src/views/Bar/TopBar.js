import React, {Component} from 'react';
import {connect} from 'react-redux';
import LanguageButton from '../../components/Language/LanguageButton';
import lang from '../../components/Language/lang';

class TopBar extends Component {
    render (){
        return (
            <header className="fs-top-bar-wrapper">
                <section className="logo-wrapper">
                    <a className="logo-link" >
                        <img alt="" src="../../images/logo.jpeg" />
                    </a>
                </section>
                <section className="login-user-wrapper">
                    <LanguageButton width={80}/>
                    <span style={{marginLeft: 10}}>{lang('您好', 'hello')}, admin</span>
                </section>
            </header>
        );
    }
}

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

export default connect(mapStateToProps)(TopBar);