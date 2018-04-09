export const snapshotActionTypes = {
    SET_SNAPSHOT_LIST: 'SET_SNAPSHOT_LIST',
};

export default {
    setSnapshotList: snapshotList => ({
        type: snapshotActionTypes.SET_SNAPSHOT_LIST,
        snapshotList
    }),
};