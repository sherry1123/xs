export default {
    // global
    language: 'chinese',

    // initialize
    initialize: {
        metadataServerIPs: [
            '192.168.100.100',
            '192.168.100.101',
            '192.168.100.102'
        ],
        storageServerIPs: [
            '192.168.100.110',
            '192.168.100.111',
            '192.168.100.112'
        ],
        clientIPs: [
            '192.168.100.120',
            '192.168.100.121',
            '192.168.100.122'
        ]
    },

    // login
    login: {

    },

    // logged
    main: {
        activeMenu: [],
        activePage: '',
        userInfo: {
            name: 'admin'
        }
    }
}