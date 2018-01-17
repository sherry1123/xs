import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';
import lang from '../../components/Language/lang';
import mainAction from '../../redux/actions/mainAction';
import Cookie from 'js-cookie';
import routerPath from '../routerPath';

class UserSettingPopover extends Component {
    forwardAccountSetting (){

    }

    logout (){
        if (process.env.NODE_ENV === 'production'){
            // fetch logout interface

        } else {
            Cookie.set('user', 'false');
        }
        this.props.history.push(routerPath.Login);
    }

    render (){
        return (
            <div style={{padding: '10px 0'}}>
                <Button icon="user" onClick={this.forwardAccountSetting.bind(this)}>
                    {lang('账户设置', 'Account Setting')}
                </Button>
                <br />
                <br />
                <Button icon="logout" onClick={this.logout.bind(this)}>
                    {lang('注销', 'Logout')}
                </Button>
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language} = state;
    return {language};
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