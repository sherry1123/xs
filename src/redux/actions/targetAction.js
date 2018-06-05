export const targetActionTypes = {
    SET_TARGET_LIST: 'SET_TARGET_LIST',
    SET_BUDDY_GROUP_LIST: 'SET_BUDDY_GROUP_LIST',
};

export default {
    setTargetList: targetList => ({
        type: targetActionTypes.SET_TARGET_LIST,
        targetList
    }),

    setBuddyGroupList: buddyGroupList => ({
        type: targetActionTypes.SET_BUDDY_GROUP_LIST,
        buddyGroupList
    }),
};