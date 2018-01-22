import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Popover} from 'antd';
import UserSettingPopover from './UserSettingPopover';
import LanguageButton from '../../components/Language/LanguageButton';
import lang from '../../components/Language/lang';

class TopBar extends Component {
    constructor (props){
        super(props);
        this.state = {
            cls: 'down'
        };
    }

    componentDidMount (){
        let prevScrollTop = 0;
        let prevDirection = 'down';
        window.addEventListener('scroll', ({target: {scrollingElement: {scrollTop}}}) => {
            let direction = scrollTop - prevScrollTop > 0 ? 'up' : 'down';
            prevScrollTop = scrollTop;
            if (direction !== prevDirection){
                prevDirection = direction;
                this.setState({
                    cls: direction
                });
            }
        });
    }

    render (){
        return (
            <header className={`fs-top-bar-wrapper ${this.state.cls}`}>
                <section className="logo-wrapper">
                    <a className="logo-link" >
                        <img alt="" src="../../images/logo.jpeg" />
                    </a>
                </section>
                <section className="login-user-wrapper">
                    <LanguageButton width={80} border="none" />
                    <Popover placement="bottom" content={<UserSettingPopover history={this.props.history} />} trigger="hover">
                        <span style={{marginLeft: 10}}>
                            {lang('您好, ', 'hello, ')}
                            <span className="fs-login-user">admin</span>
                        </span>
                    </Popover>
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