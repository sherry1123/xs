import React, {PureComponent} from 'react';
import {connect} from "react-redux";
import {Icon} from 'antd';
import lang from "../../components/Language/lang";
import {ckGet} from '../../services';
import routerPath from '../routerPath';

// The staying page during the deInitializing

class DeInitializing extends PureComponent {
    componentWillMount (){
        let isDeInit = ckGet('deInit');
        if (isDeInit !== 'true'){
            this.props.history.replace(routerPath.Root);
        }
    }

    render (){
        // 这里需要一个反初始化中的背景图
        return (
            <div className="fs-rolling-back-wrapper">
                <section className="fs-rolling-back-content">
                    <div className="fs-rolling-back-img" />
                    <p>
                        <Icon type="setting" spin style={{marginRight: 24, fontSize: 24}} />
                        {lang('系统正在反初始化中，请稍后 ...', 'System is de-initializing, please wait ...')}
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

export default connect(mapStateToProps)(DeInitializing);