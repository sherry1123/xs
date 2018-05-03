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

    // initialized and logged in (normal state)
    Main: '/orca-fs',


    // below paths are Main's children route, soo they have a common prefix '/storm-fs',
    // the corresponding views of these paths will render after Main's rendering is completed
    Dashboard: '/dashboard',

    MetadataNodes: '/metadata-nodes',

    StorageNodes: '/storage-nodes',

    ClientStatistics: '/client-statistics',

    UserStatistics: '/user-statistics',

    Snapshot: '/snapshot',
    SnapshotSchedule: '/snapshot-schedule',

    Share: '/share',

    ManagementSystemLog: '/management-system-log',

    FSOperation: '/fs-operation',
};

export default routerPath;

export const pathToMenu = {
    Dashboard: [routerPath.Dashboard],
    MetadataNodes: [routerPath.MetadataNodes],
    StorageNodes: [routerPath.StorageNodes],
    ClientStatistics: [routerPath.ClientStatistics],
    UserStatistics: [routerPath.UserStatistics],
    Snapshot: [routerPath.Snapshot, routerPath.SnapshotSchedule],
    Share: [routerPath.Share],
    Management: [routerPath.ManagementSystemLog],
    FSOperation: [routerPath.FSOperation],
};

// router interceptor rule:
// 1. If system is already initialized and is de-initializing, only DeInitializing page is allowed to access.
// 2. If system is already initialized and is rolling back, only RollingBack page is allowed to access.
// 3. If system is already initialized, but user is not in login status, only Login page is allowed to access.
// 4. If system is already initialized adn user is logged in, only pages under Main are allowed to access.
// 5. If system is not initialized, only Initialize page is allowed to access.

// All these states mentioned above are synchronized up with HTTP server before react app created in index.js.