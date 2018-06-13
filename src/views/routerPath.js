const routerPath = {
    Root: '/',

    // not initialized
    Init: '/init',

    // initialized but not logged in (or login session is invalid)
    Login: '/login',

    // error page
    Error: '/error',

    // rolling back
    RollingBack: '/rolling-back',

    // deInitializing
    DeInitializing: '/de-initializing',

    // reInitializing
    ReInitializing: '/re-initializing',

    // initialized and logged in (normal state)
    Main: '/orca-fs',

    // below paths are Main's children route, so they have a common prefix '/orca-fs',
    // the corresponding views of these paths will render after Main's rendering is completed
    Dashboard: '/dashboard',

    DataNode: '/data-node',

    Snapshot: '/snapshot',

    SnapshotSchedule: '/snapshot-schedule',

    NASServer: '/nas-server',

    NFS: '/nfs',

    CIFS: '/cifs',

    LocalAuthUser: '/local-auth-user',

    LocalAuthUserGroup: '/local-auth-user-group',

    Target: '/target',

    ServiceAndClient: '/service-and-client',

    BuddyGroup: '/buddy-group',

    SystemLog: '/system-log',

    FSOperation: '/fs-operation',

    Test: '/test',
};

export default routerPath;

export const pathToMenu = {
    Dashboard: [routerPath.Dashboard],
    DataNode: [routerPath.DataNode],
    Snapshot: [routerPath.Snapshot, routerPath.SnapshotSchedule],
    Share: [routerPath.NASServer, routerPath.NFS, routerPath.CIFS],
    ServiceAndClient: [routerPath.ServiceAndClient],
    UserAndGroup: [routerPath.LocalAuthUser, routerPath.LocalAuthUserGroup],
    TargetAndBuddyGroup: [routerPath.Target, routerPath.BuddyGroup],
    SystemLog: [routerPath.SystemLog],
    FSOperation: [routerPath.FSOperation],
};

/**
 * Router interceptor rule:
 *
 *  1. If system is already initialized and is de-initializing, only DeInitializing page is allowed to access.
 *  2. If system is already initialized and is re-initializing, only ReInitializing page is allowed to access.
 *  3. If system is already initialized and is rolling back, only RollingBack page is allowed to access.
 *  4. If system is already initialized, but user is not in login status, only Login page is allowed to access.
 *  5. If system is already initialized adn user is logged in, only pages under Main are allowed to access.
 *  6. If system is not initialized, only Initialize page is allowed to access.
 *
 *  All these states mentioned above are synchronized up with server side before react app is created in index.js.
 */