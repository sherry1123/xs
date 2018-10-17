import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Modal, Popover} from 'antd';
import TargetList from 'Components/TargetList/TargetList';
import lang from 'Components/Language/lang';

const mapStateToProps = state => {
    const {language, main: {dashboard: {clusterTargets}}} = state;
    return {language, clusterTargets};
};

@connect(mapStateToProps)
export default class ClusterTargetsRanking extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false
        };
    }

    showAllTargets (){
        this.setState({visible: true});
    }

    hideAllTargets (){
        this.setState({visible: false});
    }

    render (){
        let {clusterTargets} = this.props;
        let rankingTargets = clusterTargets.slice(0, 4);
        return (
            <div className="fs-target-ranking-wrapper">
                <header>
                    <Icon type="hdd" />{lang('存储目标使用率排行', 'Target Usage Rate Ranking')}
                    <Popover
                        content={lang('查看所有', 'View All')}
                    >
                        <Icon
                            className="fs-target-view-all"
                            type="bars"
                            onClick={this.showAllTargets.bind(this)}
                        />
                    </Popover>
                </header>
                <TargetList targets={rankingTargets} />
                <Modal
                    title={lang(`集群存储目标列表`, `Cluster Storage Target List`)}
                    width={500}
                    closable={false}
                    maskClosable={false}
                    visible={this.state.visible}
                    afterClose={this.close}
                    footer={
                        <div>
                            <Button
                                size="small"
                                type="primary"
                                onClick={this.hideAllTargets.bind(this)}
                            >
                                {lang('确定', 'Ok')}
                            </Button>
                        </div>
                    }
                >
                    <TargetList className="small-padding" targets={clusterTargets} />
                </Modal>
            </div>
        );
    }
}