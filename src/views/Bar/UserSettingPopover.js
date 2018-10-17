import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import mainAction from 'Actions/generalAction';
import {Button} from 'antd';
import ChangePassword from 'Components/ChangePassword/ChangePassword';
import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    let {language, main: {general: {user}}} = state;
    return {language, user};
};

const mapDispatchToProps = dispatch => {
    return {
        changeActivePage: key => dispatch(mainAction.changeActivePage(key))
    };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

@connect(mapStateToProps, mapDispatchToProps, mergeProps)
export default class UserSettingPopover extends Component {
    show (){
        this.changePasswordWrapper.getWrappedInstance().show();
    }

    logout (){
        // there's no need to forward to Login manually since we will verify
        // the status in cookie when each fetch request get the response
        httpRequests.logout(this.props.user);
    }

    render (){
        return (
            <div style={{padding: '5px 0'}}>
                <Button type="warning" size="small" icon="lock" onClick={this.show.bind(this)}>
                    {lang('修改密码', 'Password')}
                </Button>
                <br/>
                <Button type="danger" size="small" icon="logout" onClick={this.logout.bind(this)} style={{marginTop: 10}}>
                    {lang('注销', 'Logout')}
                </Button>
                <ChangePassword ref={ref => this.changePasswordWrapper = ref} />
            </div>
        );
    }
}