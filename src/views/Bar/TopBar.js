import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Badge, Icon, Popover} from 'antd';
import UserSettingPopover from './UserSettingPopover';
import WarningPopover from './WarningPopover';
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
                    <div className="logo-link" />
                </section>
                <section className="fs-top-info-wrapper">
                    <Popover placement="bottom" content={<WarningPopover forwardPage={this.forwardPage} history={this.props.history} />} trigger="click">
                        <Badge className="fs-alarm-wrapper" count={9} overflowCount={100}>
                            <Icon type="bell" className="fs-alarm-bell-icon" />
                        </Badge>
                    </Popover>
                    <span className="fs-login-user-wrapper">
                        {lang('您好, ', 'Hi, ')}
                        <Popover placement="bottom" content={<UserSettingPopover history={this.props.history} />} trigger="hover">
                            <span className="fs-login-user">admin</span>
                        </Popover>
                    </span>
                    <LanguageButton width={80} border="none" transparentBg />
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