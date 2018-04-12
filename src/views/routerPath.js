const routerPath = {
    // not initialized
    Init: '/init',

    // initialized but not logged in (or login session is invalid)
    Login: '/login',

    // error page
    Error: '/error',

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

    NASExport: '/nas-export',

    // ManagementKnownProblems: '/management-known-problems',
    ManagementSystemLog: '/management-system-log',

    // FSOperationStripeSettings: '/fs-operation-stripe-settings',
    // FSOperationFileBrowser: '/fs-operation-file-browser',
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
    NASExport: [routerPath.NASExport],
    Management: [/*routerPath.ManagementKnownProblems,*/ routerPath.ManagementSystemLog],
    FSOperation: [routerPath.FSOperation/*, routerPath.FSOperationStripeSettings, routerPath.FSOperationFileBrowser*/],
};