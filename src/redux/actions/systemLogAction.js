export const systemLogActionTypes = {
    SET_SYSTEM_EVENT_LOGS: 'SET_SYSTEM_EVENT_LOGS',
    SET_SYSTEM_AUDIT_LOGS: 'SET_SYSTEM_AUDIT_LOGS',
};

export default {
    setSystemEventLogs: eventLogs => ({
        type: systemLogActionTypes.SET_SYSTEM_EVENT_LOGS,
        eventLogs
    }),

    setSystemAuditLogs: auditLogs => ({
        type: systemLogActionTypes.SET_SYSTEM_AUDIT_LOGS,
        auditLogs
    }),
}