export interface AuditLogModel {

    id: number;

    userId: number;

    userName: string;

    action: string;

    controllerName: string;

    actionName: string;

    description: string;

    createdAt: string;
}