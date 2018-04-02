export const managementActionTypes = {
    SET_SYSTEM_EVENT_LOGS: 'SET_SYSTEM_EVENT_LOGS',
    SET_SYSTEM_AUDIT_LOGS: 'SET_SYSTEM_AUDIT_LOGS',
};

export default {
    setSystemEventLogs: eventLogs => ({
        type: managementActionTypes.SET_SYSTEM_EVENT_LOGS,
        eventLogs
    }),

    setSystemAuditLogs: auditLogs => ({
        type: managementActionTypes.SET_SYSTEM_AUDIT_LOGS,
        auditLogs
    }),
}