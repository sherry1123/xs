export const nasActionTypes = {
    SET_NAS_EXPORT_LIST: 'SET_NAS_EXPORT_LIST',
};

export default {
    setNasExportList: nasExportList => ({
        type: nasActionTypes.SET_NAS_EXPORT_LIST,
        nasExportList
    }),
};