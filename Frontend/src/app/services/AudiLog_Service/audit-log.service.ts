import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuditLogModel } from 'src/app/models/AuditLogModel';

@Injectable({
    providedIn: 'root'
})
export class AuditLogService {

    private apiUrl =
        'https://localhost:44314/api/AuditLog';

    constructor(
        private http: HttpClient
    ) {}

    getLogs() {

        return this.http.get<AuditLogModel[]>(
            this.apiUrl
        );

    }
}