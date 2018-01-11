import React, {Component}from 'react';
import {connect} from 'react-redux';
import {Button} from 'antd';
import LanguageAction from '../../redux/actions/languageAction';
import lang from './lang';

class LanguageButton extends Component {
    constructor (props){
        super(props);
        let {type = 'default', ghost = false, width = '100px'} = this.props;
        this.state = {
            type, ghost, width
        };
    }

    render (){
        const {changeLanguage, language} = this.props;
        return (
            <Button className="change-language-button" title={lang('切换语言', 'switch language')}
                style={{width: this.state.width, border: 'none'}} type={this.state.type} ghost={this.state.ghost}
                onClick={changeLanguage.bind(this, language === 'chinese' ? 'english' : 'chinese')}
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

const mapDispatchToProps = (dispatch) => {
    return {
        changeLanguage: language => {
            dispatch(LanguageAction.changeLan(language));
            // keep current language to localStorage, read from localStorage firstly when next browser refresh done
            localStorage.setItem('language', language);
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LanguageButton);
