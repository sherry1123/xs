import store from '../../index';

export const lang = (chinese, english) => {
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