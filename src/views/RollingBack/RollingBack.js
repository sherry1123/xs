import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import LanguageButton from 'Components/Language/LanguageButton';
import lang from 'Components/Language/lang';
import {ckGet} from 'Services';
import routerPath from '../routerPath';

class RollingBack extends PureComponent {
    componentWillMount (){
        let isRollingBack = ckGet('rollbacking');
        if (isRollingBack !== 'true'){
            this.props.history.replace(routerPath.Root);
        }
    }

    render (){
        return (
            <div className="fs-rolling-back-wrapper fs-initialize-wrapper">
                <section className="fs-rolling-back-language-btn-wrapper">
                    <LanguageButton pureText />
                </section>
                <section className="fs-rolling-back-content">
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
                    <div className="fs-rolling-back-title">
                        OrcaFS
                        <div className="fs-rolling-back-sub-title">{lang('安全、高可靠、一致、高效', 'High Security, High Reliability, High Performance, Consistent, Efficient')}</div>
                    </div>
                    <div className="fs-rolling-back-rotate-wrapper">
                        <i className="fs-rolling-back-system" />
                        <i className="fs-rolling-back-roll r-1" />
                        <i className="fs-rolling-back-roll r-2" />
                        {Object.keys(Array.apply(null, {length: 4})).map(i => (
                            <i className={`fs-rolling-back-light l-${parseInt(i, 10) + 1}`} key={i} />
                        ))}
                    </div>
                    <div className="fs-de-initializing-tip-wrapper">
                        {lang('快照正在回滚中，请稍候 ', 'Snapshot is rolling back, please wait ')}<i>.</i><i>.</i><i>.</i>
                    </div>
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