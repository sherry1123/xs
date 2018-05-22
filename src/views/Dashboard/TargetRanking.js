import React, {Component} from 'react';
import {connect} from "react-redux";
import {Button, Icon, Modal} from 'antd';
import TargetList from '../../components/TargetList/TargetList';
import lang from "../../components/Language/lang";

class TargetUsageRateRanking extends Component {
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
        let targets = [
            {targetId: 101, mountPath: '/mnt/target101', node: 'node1', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 9, free: 1024 * 1024 * 1024 * 1024 * 1, usage: '80%'}},
            {targetId: 102, mountPath: '/mnt/target102', node: 'node2', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 9, free: 1024 * 1024 * 1024 * 1024 * 1, usage: '75%'}},
            {targetId: 103, mountPath: '/mnt/target103', node: 'node3', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 9, free: 1024 * 1024 * 1024 * 1024 * 1, usage: '65%'}},
            {targetId: 104, mountPath: '/mnt/target104', node: 'node4', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 9, free: 1024 * 1024 * 1024 * 1024 * 1, usage: '55%'}},
            {targetId: 105, mountPath: '/mnt/target101', node: 'node1', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 9, free: 1024 * 1024 * 1024 * 1024 * 1, usage: '50%'}},
            {targetId: 106, mountPath: '/mnt/target102', node: 'node2', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 9, free: 1024 * 1024 * 1024 * 1024 * 1, usage: '45%'}},
            {targetId: 107, mountPath: '/mnt/target103', node: 'node3', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 9, free: 1024 * 1024 * 1024 * 1024 * 1, usage: '30%'}},
            {targetId: 108, mountPath: '/mnt/target104', node: 'node4', service: 'storage', space: { total: 1024 * 1024 * 1024 * 1024 * 10, used: 1024 * 1024 * 1024 * 1024 * 9, free: 1024 * 1024 * 1024 * 1024 * 1, usage: '21%'}},
        ];
        let rankingTargets = targets.slice(0, 4);
        return (
            <div className="fs-target-ranking-wrapper">
                <header>
                    <Icon type="bars" />{lang('存储目标使用率排行', 'Target Usage Rate Ranking')}
                    <span className="fs-target-view-all" onClick={this.showAllTargets.bind(this)}>{lang('查看所有 >>>', 'View All >>>')}</span>
                </header>
                <TargetList targets={rankingTargets} />
                <Modal
                    title={lang(`存储目标列表`, `Storage Target List`)}
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
                    <TargetList targets={targets} />
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language,} = state;
    return {language,};
};

export default connect(mapStateToProps)(TargetUsageRateRanking);