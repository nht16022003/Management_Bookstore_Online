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

                console.log('Audit Logs:', this.logs);

            },

            error => {

                console.log('Lỗi:', error);

                if (error.status === 401) {

                    alert('Bạn chưa đăng nhập');

                }

                else if (error.status === 403) {

                    alert('Bạn không có quyền xem lịch sử');

                }

                else {

                    alert('Không thể tải lịch sử hoạt động');

                }

            }

        );

    }

}