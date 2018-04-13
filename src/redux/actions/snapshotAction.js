export const snapshotActionTypes = {
    SET_SNAPSHOT_LIST: 'SET_SNAPSHOT_LIST',
    SET_SNAPSHOT_SCHEDULE_LIST: 'SET_SNAPSHOT_SCHEDULE_LIST',
};

export default {
    setSnapshotList: snapshotList => ({
        type: snapshotActionTypes.SET_SNAPSHOT_LIST,
        snapshotList
    }),

    setSnapshotScheduleList: snapshotScheduleList => ({
        type: snapshotActionTypes.SET_SNAPSHOT_SCHEDULE_LIST,
        snapshotScheduleList
    }),
};