import React, {Component}from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';
import languageAction from '../../redux/actions/languageAction';
import lang from './lang';

class LanguageButton extends Component {
    constructor (props){
        super(props);
        let {type = 'default', ghost = false, width = '100px', border = '', transparentBg = false} = this.props;
        this.state = {
            type, ghost, width, border, transparentBg
        };
    }

    render (){
        return (
            <Button className={`change-language-button ${this.state.transparentBg && 'transparent-bg'}`}
                title={lang('切换语言', 'switch language')}
                style={{width: this.state.width, border: this.state.border}}
                type={this.state.type}
                ghost={this.state.ghost}
                onClick={this.props.changeLanguage.bind(this, this.props.language === 'chinese' ? 'english' : 'chinese')}
            >
                {lang('English', '中文')}
            </Button>
        );
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
