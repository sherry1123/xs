import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import LanguageButton from '../../components/Language/LanguageButton';
import lang from '../../components/Language/lang';
import {ckGet} from '../../services';
import routerPath from '../routerPath';

class DeInitializing extends PureComponent {
    componentWillMount (){
        let isDeInit = ckGet('deinit');
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
                    <div className="fs-de-initializing-gear-rotate-wrapper">
                        {Object.keys(Array.apply(null, {length: 7})).map(i => (
                            <i className={`fs-de-initializing-gear-circle gc-${parseInt(i, 10) + 1}`} key={i} />
                        ))}
                        <i className="fs-de-initializing-gear-big" />
                        <i className="fs-de-initializing-gear-small" />
                    </div>
                    <div className="fs-de-initializing-tip-wrapper">
                        {lang('系统正在反初始化中，请稍候 ...', 'System is de-initializing, please wait ...')}
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

export default connect(mapStateToProps)(DeInitializing);