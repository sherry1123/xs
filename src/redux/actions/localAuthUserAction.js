export const localAuthUserActionTypes = {
    SET_LOCAL_AUTH_USER_LIST: 'SET_LOCAL_AUTH_USER_LIST',
    SET_LOCAL_AUTH_USER_GROUP_LIST: 'SET_LOCAL_AUTH_USER_GROUP_LIST',
    SET_LOCAL_AUTH_USER_LIST_OF_GROUP: 'SET_LOCAL_AUTH_USER_LIST_OF_GROUP',
};

export default {
    setLocalAuthUserList: localAuthUserList => ({
        type: localAuthUserActionTypes.SET_LOCAL_AUTH_USER_LIST,
        localAuthUserList
    }),

    setLocalAuthUserGroupList: localAuthUserGroupList => ({
        type: localAuthUserActionTypes.SET_LOCAL_AUTH_USER_GROUP_LIST,
        localAuthUserGroupList
    }),

    setLocalAuthUserListOfGroup: localAuthUserListOfGroup => ({
        type: localAuthUserActionTypes.SET_LOCAL_AUTH_USER_LIST_OF_GROUP,
        localAuthUserListOfGroup
    }),
};