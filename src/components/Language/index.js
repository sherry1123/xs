import {Button} from 'antd';
import {connect} from 'react-redux';
import React, {Component}from 'react';
import Language from '../../actions/Language-action';

import store from '../../index';

class LanguageButton extends Component {
    constructor (props){
        super(props);
        let {type = 'default', ghost = false, width = '100px'} = this.props;
        this.state = {
            type, ghost, width
        };
    }

    render() {
        const {changeLanguage, language} = this.props;
        return (
            <Button id="change-language-button" className="change-language-button" title={lan('切换语言', 'switch language')}
                style={{width: this.state.width}} type={this.state.type} ghost={this.state.ghost}
                onClick={changeLanguage.bind(this, language === 'chinese' ? 'english' : 'chinese')}
            >
                {lan('English', '中文')}
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
            dispatch(Language.changeLan(language));
            // keep current language to localStorage, read from localStorage firstly when next browser refresh done
            localStorage.setItem('language', language);
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LanguageButton);

export const lan = (chinese, english) => {
    let localLanguage = localStorage.getItem('language');
    if (!store){
        if (localLanguage){
            return localLanguage === 'chinese' ? chinese : english;
        } else {
            return chinese;
        }
    }
    let {language} = store.getState();
    if (localLanguage){
        language = localLanguage;
    }
    if (language === 'chinese'){
        return chinese;
    } else {
        return english ? english : chinese;
    }
};
