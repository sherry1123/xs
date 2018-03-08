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
                <Button size="small" icon="user" onClick={this.forwardAccountSetting.bind(this)}>
                    <span >{lang('账户设置', 'Account Setting')}</span>
                </Button>
                <br/>
                <Button size="small" icon="logout" onClick={this.logout.bind(this)} style={{marginTop: 10}}>
                    <span>{lang('注销', 'Logout')}</span>
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