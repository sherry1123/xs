import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';
import ChangePassword from '../../components/ChangePassword/ChangePassword';
import lang from '../../components/Language/lang';
import mainAction from '../../redux/actions/generalAction';
import httpRequests from '../../http/requests';

class UserSettingPopover extends Component {
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