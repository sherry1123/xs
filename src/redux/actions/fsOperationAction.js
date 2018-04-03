export const fsOperationActionTypes = {
    SET_ENTRY_INFO: 'SET_ENTRY_INFO',
    SET_FILES: 'SET_FILES',
};

export default {
    setEntryInfo: entryInfo => ({
        type: fsOperationActionTypes.SET_ENTRY_INFO,
        entryInfo
    }),

    setFiles: files => ({
        type: fsOperationActionTypes.SET_FILES,
        files
    }),
};