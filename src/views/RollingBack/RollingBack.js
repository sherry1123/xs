import React, {PureComponent} from 'react';
import {connect} from "react-redux";
import {Icon} from 'antd';
import lang from "../../components/Language/lang";
import {ckGet} from '../../services';
import routerPath from '../routerPath';

class RollingBack extends PureComponent {
    componentWillMount (){
        let isRollingBack = ckGet('rollbacking');
        if (isRollingBack !== 'true'){
            this.props.history.replace(routerPath.Root);
        }
    }

    render (){
        // 这里需要一个回滚中的背景图
        return (
            <div className="fs-rolling-back-wrapper">
                <section className="fs-rolling-back-content">
                    <div className="fs-rolling-back-img" />
                    <p>
                        <Icon type="setting" spin style={{marginRight: 24, fontSize: 24}} />
                        {lang('快照正在回滚中，请稍后 ...', 'Snapshot is rolling back, please wait ...')}
                    </p>
                </section>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

export default connect(mapStateToProps)(RollingBack);