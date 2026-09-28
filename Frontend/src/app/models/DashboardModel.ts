export interface DashboardSummary {
    totalBooks: number;
    totalCategories: number;
    totalUsers: number;
    totalAccounts: number;
    totalAuditLogs: number;
}

export interface AuditLogByDay {
    date: string;   // "dd/MM"
    count: number;
}

export interface BookByCategory {
    categoryName: string;
    count: number;
}

// Model mới: phân bổ số lượng User theo vai trò
export interface UserByRole {
    roleName: string;   // "ADMIN" | "STAFF" | "CUSTOMER"
    count: number;
}
