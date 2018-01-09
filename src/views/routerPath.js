export default {
    // not initialized
    Init: '/init',

    // initialized but not logged in (or login session is invalid)
    Login: '/login',

    // error page
    Error: '/error',

    // initialized and logged in (normal state)
    LoggedIndex: '/storm-storage',

    // below paths all have a common prefix '/storm-storage',
    // will render after LoggedIndex('/storm-storage') is rendered.

    StorageOverview: '/storage-overview',
    Users: '/users',

};