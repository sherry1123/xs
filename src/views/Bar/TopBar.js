import React, {Component} from 'react';
import {connect} from 'react-redux';
import {/*Badge, Icon,*/ Popover, notification} from 'antd';
import UserSettingPopover from './UserSettingPopover';
// import WarningPopover from './WarningPopover';
import LanguageButton from '../../components/Language/LanguageButton';
import lang from '../../components/Language/lang';
import {lsGet, lsSet} from "../../services";

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

    componentDidMount (){
        let abnormalNodes = lsGet('abnormalNodes');
        if (!abnormalNodes){
            lsSet('abnormalNodes', []);
        }
    }

    componentWillReceiveProps (nextProps){
        let abnormalNodes = lsGet('abnormalNodes');
        let {metadataNodes, storageNodes} = nextProps;
        let nodes = metadataNodes.concat(storageNodes);
        nodes.forEach(node => {
            if (node.value){
                let removeNodes = [];
                abnormalNodes.forEach(abnormalNode => {
                    if (node.node === abnormalNode){
                        notification.open({
                            message: lang('提示', 'Tooltip'),
                            description: lang(`${node.node} 节点状态已恢复正常。`, `The status of node ${node.node} has recovered to normal.`)
                        });
                        removeNodes.push(abnormalNode);
                    }
                });
                if (!!removeNodes.length){
                    abnormalNodes = abnormalNodes.filter(abnormalNode => !removeNodes.includes(abnormalNode));
                    lsSet('abnormalNodes', abnormalNodes);
                }
            } else {
                if (!abnormalNodes.includes(node.node)){
                    notification.open({
                        message: lang('节点异常', 'Some node is abnormal'),
                        description: lang(`${node.node} 节点现处于异常状态，请检查。`, `The node ${node.node} is abnormal now, please have a check.`)
                    });
                    abnormalNodes.push(node.node);
                    lsSet('abnormalNodes', abnormalNodes);
                }
            }
        });
    }

    render (){
        return (
            <header className={`fs-top-bar-wrapper ${this.state.direction}`}>
                <section className="logo-wrapper">
                    <div className="logo-link" />
                </section>
                <section className="fs-top-info-wrapper">
                    {/*
                       <Popover placement="bottom" content={<WarningPopover forwardPage={this.forwardPage} history={this.props.history} />} trigger="click">
                            <Badge className="fs-alarm-wrapper" count={9} overflowCount={100}>
                                <Icon type="bell" className="fs-alarm-bell-icon" />
                            </Badge>
                        </Popover>
                    */}
                    <span className="fs-login-user-wrapper">
                        {lang('您好, ', 'Hi, ')}
                        <Popover placement="bottom" content={<UserSettingPopover history={this.props.history} />} trigger="click">
                            <span className="fs-login-user">{this.props.user.username}</span>
                        </Popover>
                    </span>
                    <LanguageButton width={80} border="none" pureText />
                </section>
            </header>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {general: {user, knownProblems}, metadataNode: {overview: {status: metadataNodes}}, storageNode: {overview: {status: storageNodes}}}} = state;
    return {language, user, knownProblems, metadataNodes, storageNodes};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, [], mergeProps, options)(TopBar);