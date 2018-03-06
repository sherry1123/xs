export const languageActionTypes = {
    CHANGE_LANGUAGE: 'CHANGE_LANGUAGE',
};

export default {
    changeLan: language => ({
        type: languageActionTypes.CHANGE_LANGUAGE,
        language
    }),
};