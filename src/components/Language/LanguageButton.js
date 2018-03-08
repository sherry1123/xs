import React, {Component}from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';
import languageAction from '../../redux/actions/languageAction';
import lang from './lang';

class LanguageButton extends Component {
    constructor (props){
        super(props);
        let {type = 'default', ghost = false, width = '100px', border = '', transparentBg = false, pureText = false} = this.props;
        this.state = {
            type, ghost, width, border, transparentBg, pureText
        };
    }

    render (){
        let title = lang('切换语言', 'switch language');
        let {type, ghost, width, border, transparentBg, pureText} = this.state;
        let language = this.props.language === 'chinese' ? 'english' : 'chinese';
        return (<div className="fs-switch-language-btn-wrapper">
            {
                pureText ?
                <Button className={`fs-change-language-btn ${transparentBg ? 'transparent-bg' : ''}`}
                    title={title}
                    style={{width, border}}
                    type={type}
                    ghost={ghost}
                    onClick={this.props.changeLanguage.bind(this, language)}
                >
                    {lang('English', '中文')}
                </Button> :
                <span className="fs-change-language-pure-text"
                    title={title}
                    onClick={this.props.changeLanguage.bind(this, language)}
                >
                    {lang('English', '中文')}
                </span>
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
            // keep current language mode in localStorage, will read it from localStorage firstly after next browser refresh
            localStorage.setItem('language', language);
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LanguageButton);
