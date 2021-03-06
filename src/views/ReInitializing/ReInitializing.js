import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import LanguageButton from 'Components/Language/LanguageButton';
import lang from 'Components/Language/lang';
import {ckGet} from 'Services';
import routerPath from '../routerPath';

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

@connect(mapStateToProps)
export default class ReInitializing extends PureComponent {
    componentWillMount (){
        let isDeInit = ckGet('reinit');
        let isInitialized = ckGet('init');
        if (isDeInit !== 'true' || isInitialized !== 'true'){
            this.props.history.replace(routerPath.Root);
        }
    }

    render (){
        return (
            <div className="fs-de-initializing-wrapper fs-initialize-wrapper">
                <section className="fs-de-initializing-language-btn-wrapper">
                    <LanguageButton pureText />
                </section>
                <section className="fs-de-initializing-content">
                    <div>
                        {Object.keys(Array.apply(null, {length: 6})).map(i => (
                            <i className={`fs-initialize-background-stone b-${parseInt(i, 10) + 1}`} key={i}>
                                <i className="fs-sand" />
                                <i className="fs-earth-layer"><i className="fs-satellite" /></i>
                                <i className="fs-moon-layer"><i className="fs-satellite" /></i>
                                <i className="fs-mercury-layer"><i className="fs-satellite" /></i>
                            </i>
                        ))}
                    </div>
                    <div className="fs-de-initializing-title">
                        OrcaFS
                        <div className="fs-de-initializing-sub-title">{lang('安全、高可靠、一致、高效', 'High Security, High Reliability, High Performance, Consistent, Efficient')}</div>
                    </div>
                    <div className="fs-de-initializing-gear-rotate-wrapper">
                        {Object.keys(Array.apply(null, {length: 7})).map(i => (
                            <i className={`fs-de-initializing-gear-circle gc-${parseInt(i, 10) + 1}`} key={i} />
                        ))}
                        <i className="fs-de-initializing-gear-big" />
                        <i className="fs-de-initializing-gear-small" />
                    </div>
                    <div className="fs-de-initializing-tip-wrapper">
                        {lang('集群正在创建管理服务并开启高可用功能，请稍候 ', 'Cluster is creating management service and enable the high availability feature, please wait ')}<i>.</i><i>.</i><i>.</i>
                    </div>
                </section>
            </div>
        );
    }
}