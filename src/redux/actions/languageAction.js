export const languageActionTypes = {
    CHANGE: 'CHANGE-LANGUAGE'
};

export default {
    changeLan: language => ({
        type: languageActionTypes.CHANGE,
        language
    })
};