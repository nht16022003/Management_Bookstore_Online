import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DashboardSummary, AuditLogByDay, BookByCategory, UserByRole } from 'src/app/models/DashboardModel';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:5144/api/Dashboard';

  constructor(private http: HttpClient) {}

  // Lấy tổng hợp số liệu: tổng sách, danh mục, users, audit logs
  getSummary() {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`); //Cho line chart
  }

  // Lấy audit log theo từng ngày
  // - Nếu fromDate & toDate có giá trị → gọi theo khoảng ngày (Date Range Picker)
  // - Nếu không → fallback về N ngày gần nhất qua tham số days
  getAuditByDay(days: number = 7, fromDate?: string, toDate?: string) { //Cho bar chart
    let params = new HttpParams(); // // 1. Khởi tạo đối tượng quản lý tham số URL
    //là một đối tượng dùng để tạo và quản lý các tham số trên đường dẫn URL (Query Parameters) —
    //  tức là phần dữ liệu nằm sau dấu chấm hỏi ? trên URL.

    if (fromDate && toDate) {
      //  Gắn tham số: ?fromDate=2026-09-20&toDate=2026-09-28
      params = params.set('fromDate', fromDate).set('toDate', toDate);
    } else {
      //gắn tham số mặc định ?days=7
      params = params.set('days', days.toString());
    }
    //Ghép params vào cuối URL khi gửi request

    return this.http.get<AuditLogByDay[]>(`${this.apiUrl}/audit-by-day`, { params });
  }

  // Lấy số sách theo từng danh mục
  getBooksByCategory() {
    return this.http.get<BookByCategory[]>(`${this.apiUrl}/books-by-category`);
  }

  // [MỚI] Lấy số lượng người dùng theo từng vai trò (ADMIN / STAFF / CUSTOMER)
  getUsersByRole() {
    return this.http.get<UserByRole[]>(`${this.apiUrl}/users-by-role`);
  }

  // [TASK 8] Lấy toàn bộ dữ liệu thống kê tổng hợp cho Master Filter
  getMasterData(fromDate?: string, toDate?: string) {
    let params = new HttpParams();
    if (fromDate && toDate) {
      params = params.set('fromDate', fromDate).set('toDate', toDate);
    }
    return this.http.get<{
      summary: DashboardSummary;
      auditByDay: AuditLogByDay[];
      booksByCategory: BookByCategory[];
      usersByRole: UserByRole[];
    }>(`${this.apiUrl}/master-data`, { params });
  }
}
