export const mainActionTypes = {
    CHANGE_ACTIVE_MENU: 'CHANGE_ACTIVE_MENU',
    CHANGE_ACTIVE_PAGE: 'CHANGE_ACTIVE_PAGE'
};

export default {
    changeActiveMenu: key => ({
        type: mainActionTypes.CHANGE_ACTIVE_MENU,
        key
    }),
    changeActivePage: key => ({
        type: mainActionTypes.CHANGE_ACTIVE_PAGE,
        key
    }),
};