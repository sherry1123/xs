import React, {Component}from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';
import languageAction from '../../redux/actions/languageAction';
import {lsSet} from '../../services';
import lang from './lang';

class LanguageButton extends Component {
    constructor (props){
        super(props);
        let {style, type = 'default', ghost = false, width = '100px', border = '', transparentBg = false, pureText = false} = this.props;
        this.state = {
            style, type, ghost, width, border, transparentBg, pureText,
        };
    }

    render (){
        let tip = lang('切换语言', 'Switch Language');
        let {style, type, ghost, width, border, transparentBg, pureText} = this.state;
        let language = this.props.language === 'chinese' ? 'english' : 'chinese';
        return (<div className="fs-switch-language-btn-wrapper" style={style}>
            {
                pureText ?
                <span className="fs-change-language-pure-text"
                    title={tip}
                    onClick={this.props.changeLanguage.bind(this, language)}
                >
                    {lang('English', '中文')}
                </span> :
                <Button className={`fs-change-language-btn ${transparentBg ? 'transparent-bg' : ''}`}
                    title={tip}
                    style={{width, border}}
                    type={type}
                    ghost={ghost}
                    onClick={this.props.changeLanguage.bind(this, language)}
                >
                    {lang('English', '中文')}
                </Button>
            }
        </div>);
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

const mapDispatchToProps = dispatch => {
    return {
        changeLanguage: language => {
            dispatch(languageAction.changeLan(language));
            // keep current language mode in localStorage,
            // and will firstly read it from localStorage after the next refresh of browser
            lsSet('language', language);
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LanguageButton);
