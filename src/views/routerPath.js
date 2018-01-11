export default {
    // not initialized
    Init: '/init',

    // initialized but not logged in (or login session is invalid)
    Login: '/login',

    // error page
    Error: '/error',

    // initialized and logged in (normal state)
    Main: '/storm-storage',


    // below paths all have a common prefix '/storm-fs',
    // the corresponding views of these paths will render after Main('/storm-fs') rendering is completed.
    User: '/user',

};