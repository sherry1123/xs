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
        managementServerIPs: [
            '192.168.100.120'
        ],
        floatIPs: [
            '192.168.100.130'
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
        // file list
        fileList: [
            {name: '/opt/',portal: 'aaa',permission: 'admin',user: 'admin1',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:40:28.921Z',lastAccessTime: '2018-01-26T04:02:28.921Z'},
            {name: '/opt/dev/h',portal: 'aaa',permission: 'admin',user: 'admin2',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:33:28.921Z',lastAccessTime: '2018-01-26T04:33:28.921Z'},
            {name: '/opt/dev/a',portal: 'aaa',permission: 'admin',user: 'admin2',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:12:28.921Z',lastAccessTime: '2018-01-26T04:12:28.921Z'},
            {name: '/opt/gk',portal: 'aaa',permission: 'admin',user: 'admin3',group: 'admin',lastStatusTime: '2018-01-26T03:40:28.921Z',lastModifyTime: '2018-01-26T02:44:28.921Z',lastAccessTime: '2018-01-26T04:55:28.921Z'},
        ],
    }
}