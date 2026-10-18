import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { DashboardService } from 'src/app/services/Dashboard_Service/dashboard.service';
import { DashboardSummary, AuditLogByDay, BookByCategory, UserByRole } from 'src/app/models/DashboardModel';
import { SignalrService, DashboardRealtimeMessage } from 'src/app/services/SignalR_Service/signalr.service';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/NotificationService/notification.service';
import { signal, computed, effect, EffectRef } from 'src/app/core/signals/signal';
import { GridsterConfig, GridsterItem, GridType, DisplayGrid, CompactType } from 'angular-gridster2';

// Thư viện để xuất PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Khai báo Chart là any vì Chart.js được load qua CDN (không phải npm module)
declare const Chart: any;

export interface DashboardWidget extends GridsterItem {
  id: string;
  title: string;
  icon?: string;
  minItemRows?: number;
  minItemCols?: number;
}

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

  // ── Master Filter State (Angular Signals) ───────────────────────────────
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

  // ── Gridster 2 Configuration & Widgets State ───────────────────────────
  gridsterOptions!: GridsterConfig;

  readonly defaultWidgets: DashboardWidget[] = [
    { id: 'stat-cards', title: 'Thống kê tổng quan', cols: 12, rows: 2, x: 0, y: 0, minItemRows: 2, minItemCols: 6 },
    { id: 'line-chart', title: 'Hoạt động hệ thống theo ngày', cols: 6, rows: 6, x: 0, y: 2, minItemRows: 4, minItemCols: 4 },
    { id: 'bar-chart', title: 'Phân bổ người dùng theo vai trò', cols: 6, rows: 6, x: 6, y: 2, minItemRows: 4, minItemCols: 4 },
    { id: 'books-table', title: 'Chi tiết phân bổ sách theo danh mục', cols: 12, rows: 5, x: 0, y: 8, minItemRows: 3, minItemCols: 6 }
  ];

  dashboardWidgets = signal<DashboardWidget[]>([]);

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
    // 1. Khởi tạo cấu hình Gridster 2 kéo thả và thay đổi kích thước
    this.initGridsterOptions();

    // 2. Phục hồi layout từ localStorage hoặc dùng mặc định
    this.initLayout();

    // 3. Đăng ký side-effect theo dõi trạng thái Real-time bằng effect()
    this.stateEffectRef = effect(() => {
      const connected = this.isRealtimeConnected();
      console.log(`[Dashboard Signal State] Trạng thái kết nối Real-time: ${connected ? 'ONLINE' : 'CONNECTING...'}`);
    });

    // 4. Tải dữ liệu Dashboard ban đầu bằng Master Filter API
    this.loadDashboardData();
    this.initSignalR();
  }

  // Khởi tạo tùy chọn Gridster 2
  private initGridsterOptions(): void {
    this.gridsterOptions = {
      gridType: GridType.ScrollVertical,
      displayGrid: DisplayGrid.OnDragAndResize,
      compactType: CompactType.None,
      pushItems: true,
      draggable: {
        enabled: true,
        ignoreContentClass: 'gridster-no-drag'
      },
      resizable: {
        enabled: true
      },
      minCols: 12,
      maxCols: 12,
      minRows: 12,
      defaultItemCols: 6,
      defaultItemRows: 5,
      itemChangeCallback: () => this.saveDashboardLayout(),
      itemResizeCallback: (item) => this.onWidgetResize(item)
    };
  }

  // ── Layout Management (Lưu và phục hồi vào localStorage) ────────────────

  initLayout(): void {
    try {
      const saved = localStorage.getItem('dashboard_layout');
      if (saved) {
        const parsed: any[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = this.defaultWidgets.map(def => {
            const found = parsed.find(p => p.id === def.id);
            return found ? { ...def, x: found.x, y: found.y, rows: found.rows, cols: found.cols } : def;
          });
          this.dashboardWidgets.set(merged);
          return;
        }
      }
    } catch (err) {
      console.warn('Lỗi phân tích cú pháp layout từ localStorage, sử dụng layout mặc định', err);
    }
    this.dashboardWidgets.set(this.defaultWidgets.map(w => ({ ...w })));
  }

  saveDashboardLayout(): void {
    try {
      const current = this.dashboardWidgets().map(w => ({
        id: w.id,
        x: w.x,
        y: w.y,
        rows: w.rows,
        cols: w.cols
      }));
      localStorage.setItem('dashboard_layout', JSON.stringify(current));
    } catch (err) {
      console.error('Không thể lưu layout Dashboard vào localStorage', err);
    }
  }

  resetLayout(): void {
    localStorage.removeItem('dashboard_layout');
    this.dashboardWidgets.set(this.defaultWidgets.map(w => ({ ...w })));
    if (this.gridsterOptions.api && this.gridsterOptions.api.optionsChanged) {
      this.gridsterOptions.api.optionsChanged();
    }
    setTimeout(() => {
      this.lineChart?.resize();
      this.barChart?.resize();
    }, 150);
    this.notification.info('Đã khôi phục bố cục Dashboard về mặc định ban đầu.', 'Bố cục mặc định');
  }

  onWidgetResize(item: GridsterItem): void {
    this.saveDashboardLayout();
    setTimeout(() => {
      if (this.lineChart) { this.lineChart.resize(); }
      if (this.barChart) { this.barChart.resize(); }
    }, 100);
  }

  // ── SignalR Real-time Hub ──────────────────────────────────────────────

  private initSignalR(): void {
    this.signalrService.startConnection();

    this.isConnectedSub = this.signalrService.isConnected$.subscribe(status => {
      this.isRealtimeConnected.set(status);
    });

    this.signalrSub = this.signalrService.dashboardUpdate$.subscribe(
      (msg: DashboardRealtimeMessage) => {
        this.handleRealtimeUpdate(msg);
      }
    );
  }

  private handleRealtimeUpdate(msg: DashboardRealtimeMessage): void {
    // Tải lại dữ liệu thống kê từ API bằng Master Filter
    this.dashboardService.getMasterData(this.fromDate(), this.toDate()).subscribe(res => {
      this.summary.set(res.summary);
      this.auditByDay.set(res.auditByDay);
      this.booksByCategory.set(res.booksByCategory);
      this.usersByRole.set(res.usersByRole);
      this.updateLineChart();
      this.renderBarChart();
    });

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

    if (this.lineChart) { this.lineChart.destroy(); this.lineChart = null; }
    if (this.barChart) { this.barChart.destroy(); this.barChart = null; }
  }

  // ── Date Helpers ───────────────────────────────────────────────────────

  getDefaultFromDate(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo + 1);
    return this.formatDateForInput(d);
  }

  getTodayString(): string {
    return this.formatDateForInput(new Date());
  }

  private formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ── Master Filter Handlers ─────────────────────────────────────────────

  setPresetDays(days: number): void {
    this.fromDate.set(this.getDefaultFromDate(days));
    this.toDate.set(this.getTodayString());
    this.onDateChange();
  }

  onDateChange(): void {
    const currentFrom = this.fromDate();
    const currentTo = this.toDate();
    if (!currentFrom || !currentTo) return;
    if (currentFrom > currentTo) return;

    this.isChartUpdating.set(true);

    // Sử dụng endpoint master-data tối ưu bằng Raw SQL
    this.dashboardService.getMasterData(currentFrom, currentTo).subscribe(
      res => {
        this.summary.set(res.summary);
        this.auditByDay.set(res.auditByDay);
        this.booksByCategory.set(res.booksByCategory);
        this.usersByRole.set(res.usersByRole);
        this.isChartUpdating.set(false);
        this.updateLineChart();
        this.renderBarChart();
      },
      err => {
        this.isChartUpdating.set(false);
      }
    );
  }

  // ── Load Data (Lần đầu bằng Master Data API) ───────────────────────────

  loadDashboardData(): void {
    this.isLoading.set(true);

    this.dashboardService.getMasterData(this.fromDate(), this.toDate()).subscribe(
      res => {
        this.summary.set(res.summary);
        this.auditByDay.set(res.auditByDay);
        this.booksByCategory.set(res.booksByCategory);
        this.usersByRole.set(res.usersByRole);
        this.isLoading.set(false);
        this.dataReady = true;

        if (this.viewReady) {
          setTimeout(() => this.renderCharts(), 0);
        }
      },
      err => {
        this.isLoading.set(false);
      }
    );
  }

  // ── Render Charts ──────────────────────────────────────────────────────

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

  // ── Dynamic PDF theo Layout Gridster Hiện Tại ──────────────────────────

  xuatBaoCaoPDF(): void {
    if (this.isLoading() || this.isChartUpdating() || !this.dataReady) {
      this.notification.warning('Dữ liệu biểu đồ đang được tải hoặc cập nhật, vui lòng chờ trong giây lát...', 'Thông báo');
      return;
    }

    // Chụp phần tử chứa toàn bộ layout Gridster
    const phanTuCanChup = document.getElementById('dashboardReport');
    if (!phanTuCanChup) {
      this.notification.error('Không tìm thấy vùng dữ liệu Dashboard để xuất PDF.', 'Lỗi');
      return;
    }

    this.dangTaoPDF.set(true);

    // Chờ biểu đồ render hoàn tất animation trước khi chụp
    setTimeout(() => {
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

        // Chia nhiều trang tự động nếu layout Gridster dài hơn 1 trang A4
        while (chieuCaoConLai > 0) {
          viTriY -= chieuCaoKhaDung;
          tepPDF.addPage();
          tepPDF.addImage(duLieuAnh, 'PNG', leX, viTriY, chieuRongKhaDung, chieuCaoAnh);
          chieuCaoConLai -= chieuCaoKhaDung;
        }

        // Tên file theo định dạng chuẩn: Report_Dashboard_TuNgay_DenNgay.pdf
        const tenFile = `Report_Dashboard_${this.fromDate()}_${this.toDate()}.pdf`;
        tepPDF.save(tenFile);

        this.dangTaoPDF.set(false);
        this.notification.success('Đã tải xuống file báo cáo PDF theo layout hiện tại thành công!', 'Thành công');
      }).catch(loi => {
        console.error('Lỗi trong quá trình xuất PDF:', loi);
        this.dangTaoPDF.set(false);
        this.notification.error('Không thể xuất file PDF. Vui lòng thử lại.', 'Lỗi');
      });
    }, 200);
  }

}


