import { Component, OnInit } from '@angular/core';
import { AuditLogModel } from 'src/app/models/AuditLogModel';
import { AuditLogService } from 'src/app/services/AudiLog_Service/audit-log.service';

@Component({
    selector: 'app-audit-log',
    templateUrl: './audit-log-page.component.html',
    styleUrls: ['./audit-log-page.component.css']
})
export class AuditLogComponent implements OnInit {

    logs: AuditLogModel[] = [];

    constructor(
        private auditLogService: AuditLogService
    ) {}

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs(): void {
        this.auditLogService.getLogs().subscribe(
            data => {
                this.logs = data;
            }
            // Không cần error handler:
            // 401 → ErrorInterceptor tự xóa token + redirect /login + Toast
            // 403 → ErrorInterceptor tự hiện Toast "Không có quyền"
            // 500 → ErrorInterceptor tự hiện Toast "Lỗi server"
        );
    }
}