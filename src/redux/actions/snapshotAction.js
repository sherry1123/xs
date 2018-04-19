export const snapshotActionTypes = {
    SET_SNAPSHOT_LIST: 'SET_SNAPSHOT_LIST',
    SET_SNAPSHOT_SCHEDULE_LIST: 'SET_SNAPSHOT_SCHEDULE_LIST',
    SET_SNAPSHOT_SETTING: 'SET_SNAPSHOT_SETTING',
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

    setSnapshotSetting: snapshotSetting => ({
        type: snapshotActionTypes.SET_SNAPSHOT_SETTING,
        snapshotSetting
    }),
};