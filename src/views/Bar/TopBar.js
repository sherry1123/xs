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
            direction: 'down'
        };
    }

    switchScrollDirection (direction){
        this.setState({direction});
    }

    render (){
        return (
            <header className={`fs-top-bar-wrapper ${this.state.direction}`}>
                <section className="logo-wrapper">
                    <div className="logo-link" >
                        <i className="rock-point" />
                    </div>
                </section>
                <section className="login-user-wrapper">
                    <LanguageButton width={80} border="none" transparentBg />
                    <Popover placement="bottom" content={<UserSettingPopover history={this.props.history} />} trigger="hover">
                        <span style={{marginLeft: 10}}>
                            {lang('您好, ', 'hello, ')}
                            <span className="fs-login-user">admin 3333322</span>
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

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(TopBar);