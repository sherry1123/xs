import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';
import lang from '../../components/Language/lang';
import mainAction from '../../redux/actions/generalAction';
import httpRequests from '../../http/requests';

class UserSettingPopover extends Component {
    forwardAccountSetting (){

    }

    logout (){
        // there's no need to forward to Login manually since we will verify
        // the status in cookie when each fetch request get the response
        httpRequests.logout(this.props.user.username);
    }

    render (){
        return (
            <div style={{padding: '5px 0'}}>
                {/*
                <Button size="small" icon="user" onClick={this.forwardAccountSetting.bind(this)}>
                    <span >{lang('账户设置', 'Account Setting')}</span>
                </Button>
                <br/>
                */}
                <Button size="small" icon="logout" onClick={this.logout.bind(this)}>
                    <span>{lang('注销', 'Logout')}</span>
                </Button>
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {general: {user}}} = state;
    return {language, user};
};

const mapDispatchToProps = dispatch => {
    return {
        changeActivePage: key => dispatch(mainAction.changeActivePage(key))
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(UserSettingPopover);