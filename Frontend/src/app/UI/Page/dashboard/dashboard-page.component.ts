import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { DashboardService } from 'src/app/services/Dashboard_Service/dashboard.service';
import { DashboardSummary, AuditLogByDay, BookByCategory, UserByRole } from 'src/app/models/DashboardModel';
import { SignalrService, DashboardRealtimeMessage } from 'src/app/services/SignalR_Service/signalr.service';
import { forkJoin, Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/NotificationService/notification.service';
import { signal, computed, effect, EffectRef } from 'src/app/core/signals/signal';

// Thư viện để xuất PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Khai báo Chart là any vì Chart.js được load qua CDN (không phải npm module)
declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  // ── Angular Signals Reactive State ─────────────────────────────────────
  readonly isLoading = signal<boolean>(true);
  readonly isChartUpdating = signal<boolean>(false);
  readonly isRealtimeConnected = signal<boolean>(false);
  readonly dangTaoPDF = signal<boolean>(false);

  readonly summary = signal<DashboardSummary>({
    totalBooks: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalAccounts: 0,
    totalAuditLogs: 0
  });

  readonly auditByDay = signal<AuditLogByDay[]>([]);
  readonly booksByCategory = signal<BookByCategory[]>([]);
  readonly usersByRole = signal<UserByRole[]>([]);

  // ── Date Range Picker State (Quản lý bằng Signals) ──────────────────────
  readonly fromDate = signal<string>(this.getDefaultFromDate(7));
  readonly toDate = signal<string>(this.getTodayString());

  // Getter/setter tương thích two-way binding form controls
  get fromDateValue(): string { return this.fromDate(); }
  set fromDateValue(val: string) { this.fromDate.set(val); }

  get toDateValue(): string { return this.toDate(); }
  set toDateValue(val: string) { this.toDate.set(val); }

  // ── Computed Values (Dẫn xuất tự động từ Signals) ───────────────────────
  readonly totalAuditInRange = computed(() => {
    return this.auditByDay().reduce((sum, d) => sum + d.count, 0);
  });

  readonly totalUsersFromRoles = computed(() => {
    return this.usersByRole().reduce((sum, r) => sum + r.count, 0);
  });

  // ── Chart Instances ────────────────────────────────────────────────────
  private lineChart: any = null;   // Line Chart — Audit Log theo ngày
  private barChart: any = null;   // Bar Chart  — User theo Role

  // Cờ đồng bộ hóa dữ liệu & view
  private dataReady = false;
  private viewReady = false;

  private signalrSub!: Subscription;
  private isConnectedSub!: Subscription;
  private stateEffectRef?: EffectRef;

  constructor(
    private dashboardService: DashboardService,
    private signalrService: SignalrService,
    private notification: NotificationService
  ) { }

  // ── Lifecycle Hooks ────────────────────────────────────────────────────

  ngOnInit(): void {
    // Đăng ký side-effect theo dõi trạng thái Real-time bằng effect()
    this.stateEffectRef = effect(() => {
      const connected = this.isRealtimeConnected();
      console.log(`[Dashboard Signal State] Trạng thái kết nối Real-time: ${connected ? 'ONLINE' : 'CONNECTING...'}`);
    });

    this.loadDashboardData();
    this.initSignalR();
  }

  // Khởi tạo và lắng nghe kết nối real time
  private initSignalR(): void {
    this.signalrService.startConnection();

    this.isConnectedSub = this.signalrService.isConnected$.subscribe(status => {
      this.isRealtimeConnected.set(status);
    });

    // Bắt sự kiện có thao tác mới phát sinh trong hệ thống:
    this.signalrSub = this.signalrService.dashboardUpdate$.subscribe(
      (msg: DashboardRealtimeMessage) => {
        this.handleRealtimeUpdate(msg);
      }
    );
  }

  // Xử lý cập nhật số liệu từ Dashboard API hiện có (giữ nguyên bộ lọc thời gian)
  private handleRealtimeUpdate(msg: DashboardRealtimeMessage): void {
    // A. Tải lại Summary chính xác từ API
    this.dashboardService.getSummary().subscribe(summary => {
      this.summary.set(summary);
    });

    // B. Tải lại dữ liệu biểu đồ audit theo đúng bộ lọc thời gian đang áp dụng
    this.dashboardService.getAuditByDay(7, this.fromDate(), this.toDate()).subscribe(data => {
      this.auditByDay.set(data);
      this.updateLineChart();
    });

    // C. Cập nhật bảng phân bổ sách nếu thao tác liên quan tới sách hoặc danh mục
    if (!msg.controllerName || msg.controllerName === 'Book' || msg.controllerName === 'Category') {
      this.dashboardService.getBooksByCategory().subscribe(books => {
        this.booksByCategory.set(books);
      });
    }

    // D. Cập nhật biểu đồ vai trò người dùng nếu liên quan tới Account/User
    if (msg.controllerName === 'Account' || msg.controllerName === 'User') {
      this.dashboardService.getUsersByRole().subscribe(roles => {
        this.usersByRole.set(roles);
        this.renderBarChart();
      });
    }

    // E. Thông báo nhẹ góc màn hình
    this.notification.info(
      `${msg.userName} vừa thực hiện: ${msg.description}`,
      '⚡ Hoạt động mới'
    );
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.dataReady) {
      this.renderCharts();
    }
  }

  ngOnDestroy(): void {
    // Hủy đăng ký SignalR để tránh rò rỉ bộ nhớ
    if (this.signalrSub) {
      this.signalrSub.unsubscribe();
    }
    if (this.isConnectedSub) {
      this.isConnectedSub.unsubscribe();
    }
    if (this.stateEffectRef) {
      this.stateEffectRef.destroy();
    }
    this.signalrService.stopConnection();

    // Dọn dẹp instance chart khi rời trang, tránh memory leak
    if (this.lineChart) { this.lineChart.destroy(); this.lineChart = null; }
    if (this.barChart) { this.barChart.destroy(); this.barChart = null; }
  }

  // ── Date Helpers ───────────────────────────────────────────────────────

  // Trả về chuỗi "yyyy-MM-dd" cho N ngày trước hôm nay
  getDefaultFromDate(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo + 1);
    return this.formatDateForInput(d);
  }

  // Trả về chuỗi "yyyy-MM-dd" cho hôm nay
  getTodayString(): string {
    return this.formatDateForInput(new Date());
  }

  // Format Date → "yyyy-MM-dd" (định dạng chuẩn của input[type="date"])
  private formatDateForInput(date: Date): string {  // private OK, chỉ helper nội bộ
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ── Date Range Picker Handler ──────────────────────────────────────────

  // Thiết lập nhanh khoảng ngày theo preset
  setPresetDays(days: number): void {
    this.fromDate.set(this.getDefaultFromDate(days));
    this.toDate.set(this.getTodayString());
    this.onDateChange();
  }

  // Được gọi mỗi khi người dùng thay đổi fromDate hoặc toDate
  onDateChange(): void {
    const currentFrom = this.fromDate();
    const currentTo = this.toDate();
    if (!currentFrom || !currentTo) return;
    if (currentFrom > currentTo) return;

    this.isChartUpdating.set(true);

    // Chỉ gọi lại Service để lấy dữ liệu trong khoảng ngày mới
    this.dashboardService.getAuditByDay(7, currentFrom, currentTo).subscribe(
      data => {
        this.auditByDay.set(data);
        this.isChartUpdating.set(false);
        this.updateLineChart();
      }
    );
  }

  // ── Load Data (lần đầu) ────────────────────────────────────────────────

  loadDashboardData(): void {
    this.isLoading.set(true);

    // Gọi 4 API song song, chờ tất cả xong mới xử lý
    forkJoin({
      summary: this.dashboardService.getSummary(),
      auditByDay: this.dashboardService.getAuditByDay(7, this.fromDate(), this.toDate()),
      booksByCategory: this.dashboardService.getBooksByCategory(),
      usersByRole: this.dashboardService.getUsersByRole()
    }).subscribe(
      results => {
        this.summary.set(results.summary);
        this.auditByDay.set(results.auditByDay);
        this.booksByCategory.set(results.booksByCategory);
        this.usersByRole.set(results.usersByRole);
        this.isLoading.set(false);
        this.dataReady = true;

        // Nếu view đã render → vẽ chart ngay
        if (this.viewReady) {
          setTimeout(() => this.renderCharts(), 0);
        }
      }
    );
  }

  // ── Render Charts (lần đầu) ────────────────────────────────────────────

  private renderCharts(): void {
    this.renderLineChart();
    this.renderBarChart();
  }

  // ── LINE CHART: Audit Log theo ngày ───────────────────────────────────

  private renderLineChart(): void {
    const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.lineChart) { this.lineChart.destroy(); }

    const auditData = this.auditByDay();

    this.lineChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: auditData.map(d => d.date),
        datasets: [{
          label: 'Số thao tác',
          data: auditData.map(d => d.count),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.10)',
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.parsed.y} thao tác`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // Cập nhật Line Chart in-place khi đổi date range (animation mượt)
  private updateLineChart(): void {
    if (!this.lineChart) {
      this.renderLineChart();
      return;
    }

    const auditData = this.auditByDay();
    this.lineChart.data.labels = auditData.map(d => d.date);
    this.lineChart.data.datasets[0].data = auditData.map(d => d.count);
    this.lineChart.update('active');
  }

  // ── BAR CHART: User theo Role ──────────────────────────────────────────

  private renderBarChart(): void {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.barChart) { this.barChart.destroy(); }

    const roleColors: { [key: string]: string } = {
      'ADMIN': 'rgba(239, 68, 68,  0.80)',
      'STAFF': 'rgba(59,  130, 246, 0.80)',
      'CUSTOMER': 'rgba(16,  185, 129, 0.80)',
    };
    const roleBorders: { [key: string]: string } = {
      'ADMIN': 'rgba(239, 68, 68,  1)',
      'STAFF': 'rgba(59,  130, 246, 1)',
      'CUSTOMER': 'rgba(16,  185, 129, 1)',
    };

    const rolesData = this.usersByRole();
    const labels = rolesData.map(u => u.roleName);
    const counts = rolesData.map(u => u.count);
    const bgs = labels.map(l => roleColors[l] || 'rgba(148,163,184,0.8)');
    const bds = labels.map(l => roleBorders[l] || 'rgba(148,163,184,1)');

    this.barChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Số người dùng',
          data: counts,
          backgroundColor: bgs,
          borderColor: bds,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: 'easeOutBounce' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.parsed.y} người dùng`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // ── Xuất Báo Cáo PDF ───────────────────────────────────────────────────

  xuatBaoCaoPDF(): void {
    // 1. Kiểm tra trạng thái sẵn sàng của Dashboard và dữ liệu biểu đồ
    if (this.isLoading() || this.isChartUpdating() || !this.dataReady) {
      this.notification.warning('Dữ liệu biểu đồ đang được tải hoặc cập nhật, vui lòng chờ trong giây lát...', 'Thông báo');
      return;
    }

    // 2. Tìm phần tử HTML của màn hình Dashboard cần chụp
    const phanTuCanChup = document.getElementById('dashboardReport');
    if (!phanTuCanChup) {
      this.notification.error('Không tìm thấy vùng dữ liệu Dashboard để xuất PDF.', 'Lỗi');
      return;
    }

    this.dangTaoPDF.set(true);

    setTimeout(() => {
      // 3. Dùng html2canvas chụp màn hình HTML thành Canvas chất lượng cao
      html2canvas(phanTuCanChup, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc'
      }).then(canvas => {
        const duLieuAnh = canvas.toDataURL('image/png');
        const tepPDF = new jsPDF('l', 'mm', 'a4');
        const chieuRongTrang = tepPDF.internal.pageSize.getWidth();
        const chieuCaoTrang  = tepPDF.internal.pageSize.getHeight();
        const leX = 10;
        const leY = 10;
        const chieuRongKhaDung = chieuRongTrang - leX * 2;
        const chieuCaoKhaDung  = chieuCaoTrang - leY * 2;

        const chieuCaoAnh = (canvas.height * chieuRongKhaDung) / canvas.width;

        let viTriY = leY;
        let chieuCaoConLai = chieuCaoAnh;

        // Trang đầu tiên
        tepPDF.addImage(duLieuAnh, 'PNG', leX, viTriY, chieuRongKhaDung, chieuCaoAnh);
        chieuCaoConLai -= chieuCaoKhaDung;

        // 7. Hỗ trợ chia trang tự động nếu Dashboard dài vượt quá 1 trang A4
        while (chieuCaoConLai > 0) {
          viTriY -= chieuCaoKhaDung;
          tepPDF.addPage();
          tepPDF.addImage(duLieuAnh, 'PNG', leX, viTriY, chieuRongKhaDung, chieuCaoAnh);
          chieuCaoConLai -= chieuCaoKhaDung;
        }

        const tenFile = `Dashboard_Report_${this.fromDate()}_den_${this.toDate()}.pdf`;
        tepPDF.save(tenFile);

        this.dangTaoPDF.set(false);
        this.notification.success('Đã tải xuống file báo cáo PDF thành công!', 'Thành công');
      }).catch(loi => {
        console.error('Lỗi trong quá trình xuất PDF:', loi);
        this.dangTaoPDF.set(false);
        this.notification.error('Không thể xuất file PDF. Vui lòng thử lại.', 'Lỗi');
      });
    }, 100);
  }

}

