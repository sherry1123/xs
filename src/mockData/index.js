export default {
    // global
    language: 'chinese',

    // initialize
    initialize: {
        metadataServerIPs: [
            '192.168.100.100'
        ],
        storageServerIPs: [
            '192.168.100.110'
        ],
        clientIPs: [
            '192.168.100.120'
        ],
    },

    // login
    login: {

    },

    // logged
    main: {
        // general
        activeMenu: [],
        activePage: '',
        // login user
        userInfo: {
            name: 'admin'
        },
        // stripe
        stripeInformation: {
            path: '/opt/xxx/ada',
            defaultTargetNumber: 1,
            blockSize: 1024,
            stripeMode: 'buddyMirror',
            isMetadataImage: true,
        },
    }
}