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

        // bind browser switch from online/offline status event
        window.addEventListener('offline', () => {
            notification.warning({
                message: lang('网络异常', 'Network Abnormally'),
                description: lang(`浏览器处于离线状态，强检查网络连接！`, `Browser is offline, please check network connection!`)
            });
        });
        window.addEventListener('online', () => {
            notification.success({
                message: lang('网络恢复', 'Network Recovery'),
                description: lang(`浏览器处于在线状态，网络已恢复正常！`, `Browser is online, network has recovered to normal status!`)
            });
        });
    }

    componentWillReceiveProps (nextProps){
        let abnormalNodes = lsGet('abnormalNodes');
        let {metadataNodes, storageNodes} = nextProps;
        let nodes = metadataNodes.concat(storageNodes);
        // because metadata and storage servers can run on one same node, so their 'hostname' may be the same,
        // for this case, it demands one other key 'type' to collaborate with 'hostname' to distinguish different server nodes precisely.
        nodes.forEach(node => {
            if (node.status){
                let removeNodes = [];
                abnormalNodes.forEach(abnormalNode => {
                    if (`${node.type}-${node.hostname}` === abnormalNode){
                        notification.open({
                            message: lang('节点恢复', 'Node Recovery'),
                            description: lang(`${node.type === 'metadata' ? '元数据' : '存储节点' } ${node.hostname} 状态已恢复正常。`, `The status of ${node.type} node ${node.hostname} has recovered to normal.`)
                        });
                        removeNodes.push(abnormalNode);
                    }
                });
                if (!!removeNodes.length){
                    abnormalNodes = abnormalNodes.filter(abnormalNode => !removeNodes.includes(abnormalNode));
                    lsSet('abnormalNodes', abnormalNodes);
                }
            } else {
                if (!abnormalNodes.includes(`${node.type}-${node.hostname}`)){
                    notification.open({
                        message: lang('节点异常', 'Node Abnormally'),
                        description: lang(`${node.type === 'metadata' ? '元数据' : '存储节点' } ${node.hostname} 现处于异常状态，请检查。`, `The ${node.type} node ${node.hostname} is abnormal now, please have a check.`)
                    });
                    abnormalNodes.push(`${node.type}-${node.hostname}`);
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
                        <Popover placement="bottom" content={<UserSettingPopover />} trigger="click">
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
    let {language, main: {general: {user, knownProblems}, metadataNode: {overview: {nodeList: metadataNodes}}, storageNode: {overview: {nodeList: storageNodes}}}} = state;
    return {language, user, knownProblems, metadataNodes, storageNodes};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, [], mergeProps, options)(TopBar);