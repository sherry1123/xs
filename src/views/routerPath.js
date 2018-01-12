const routerPath = {
    // not initialized
    Init: '/init',

    // initialized but not logged in (or login session is invalid)
    Login: '/login',

    // error page
    Error: '/error',

    // initialized and logged in (normal state)
    Main: '/storm-storage',


    // below paths all have a common prefix '/storm-fs',
    // the corresponding views of these paths will render after Main('/storm-fs') rendering is completed
    MetadataNodesOverview: '/metadata-nodes-overview',
    MetadataNodesDetail: '/metadata-nodes-detail',

    StorageNodesOverview: '/storage-nodes-overview',
    StorageNodesDetail: '/storage-nodes-detail',

    ClientStatisticsMetadata: '/client-statistics-metadata',
    ClientStatisticsStorage: '/client-statistics-storage',

    UserStatisticsMetadata: '/user-statistics-metadata',
    UserStatisticsStorage: '/user-statistics-storage',

    ManagementKnownProblems: '/management-known-problems',
    ManagementLogFile: '/management-log-file',

    FSOperationStripeSettings: '/fs-operation-stripe-settings',
    FSOperationFileBrowser: '/fs-operation-file-browser',
};

export default routerPath;

export const pathToMenu = {
    MetadataNodes: [routerPath.MetadataNodesOverview, routerPath.MetadataNodesDetail],
    StorageNodes: [routerPath.StorageNodesOverview, routerPath.StorageNodesDetail],
    ClientStatistics: [routerPath.ClientStatisticsMetadata, routerPath.ClientStatisticsStorage],
    UserStatistics: [routerPath.UserStatisticsMetadata, routerPath.UserStatisticsStorage],
    Management: [routerPath.ManagementKnownProblems, routerPath.ManagementLogFile],
    FSOperation: [routerPath.FSOperationStripeSettings, routerPath.FSOperationFileBrowser]
};