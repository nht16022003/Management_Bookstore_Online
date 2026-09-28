import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { DashboardService } from 'src/app/services/Dashboard_Service/dashboard.service';
import { DashboardSummary, AuditLogByDay, BookByCategory, UserByRole } from 'src/app/models/DashboardModel';
import { SignalrService, DashboardRealtimeMessage } from 'src/app/services/SignalR_Service/signalr.service';
import { forkJoin, Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/NotificationService/notification.service';


//Thư viện để xuất PDF
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

  // ── State ──────────────────────────────────────────────────────────────
  isLoading = true;
  isChartUpdating = false;   // Hiệu ứng loading nhẹ khi đổi date range

  summary: DashboardSummary = {
    totalBooks: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalAccounts: 0,
    totalAuditLogs: 0
  };

  auditByDay: AuditLogByDay[] = [];
  booksByCategory: BookByCategory[] = [];
  usersByRole: UserByRole[] = [];   // [MỚI] Dữ liệu Bar Chart User theo Role

  // ── Date Range Picker State ────────────────────────────────────────────
  // Giá trị mặc định: 7 ngày gần nhất
  fromDate: string = this.getDefaultFromDate(7);
  toDate: string = this.getTodayString();

  // ── Chart Instances ────────────────────────────────────────────────────
  private lineChart: any = null;   // Line Chart — Audit Log theo ngày
  private barChart: any = null;   // Bar Chart  — User theo Role

  // Cờ đồng bộ hóa dữ liệu & view
  private dataReady = false;
  private viewReady = false;


  private signalrSub!: Subscription;
  isRealtimeConnected = false;

  constructor(private dashboardService: DashboardService,  private signalrService: SignalrService, private notification: NotificationService) { }

  // ── Lifecycle Hooks ────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadDashboardData();
    this.initSignalR();
  }

  //Khởi tạo và lắng nghe kết nối real time
  private initSignalR():void{
    this.signalrService.startConnection();

    this.signalrService.isConnected$.subscribe(status => {
      this.isRealtimeConnected = status;
      // Bắt sự kiện có thao tác mới phát sinh trong hệ thống:
    this.signalrSub = this.signalrService.dashboardUpdate$.subscribe(
      (msg: DashboardRealtimeMessage) => {
        this.handleRealtimeUpdate(msg);
      }
    )
  
  })}


  // 2. Xử lý cập nhật số liệu ngay tại chỗ (In-place)
  private handleRealtimeUpdate(msg: DashboardRealtimeMessage): void {
    // A. Tăng tổng số AuditLog trên Stat Card
    this.summary.totalAuditLogs++;

    // B. Tìm ngày hôm nay trong mảng Line Chart để tăng số lượng
    const todayStr = this.getTodayString();
    const todayFormatted = todayStr.split('-')[2] + '/' + todayStr.split('-')[1]; // vd: "28/09"
    
    const todayItem = this.auditByDay.find(d => d.date === todayFormatted || d.date === msg.dateString);
    if (todayItem) {
      todayItem.count++;
    } else {
      this.auditByDay.push({ date: msg.dateString, count: 1 });
    }

    // C. Cập nhật biểu đồ chuyển động ngay lập tức!
    this.updateLineChart();

    // D. Bắn thông báo nhẹ góc màn hình
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

  // Được gọi mỗi khi người dùng thay đổi fromDate hoặc toDate
  onDateChange(): void {
    if (!this.fromDate || !this.toDate) return;
    if (this.fromDate > this.toDate) return;  // Bỏ qua nếu khoảng không hợp lệ

    this.isChartUpdating = true; //Dùng để hiện huy hiệu nhỏ đang cập nhật ở trên góc biểu đồ

    // Chỉ gọi lại Service để lấy dữ liệu trong khoảng ngày mới
    this.dashboardService.getAuditByDay(7, this.fromDate, this.toDate).subscribe(
      data => {
        this.auditByDay = data; //Nhận dữ liệu mới
        this.isChartUpdating = false; //Tắt huy hiệu loading

        // Cập nhật chart in-place (animation mượt mà, không destroy/recreate)
        this.updateLineChart(); //Gọi updateLineChart() để vẽ lại
      }
    );
  }

  // ── Load Data (lần đầu) ────────────────────────────────────────────────

  loadDashboardData(): void {
    this.isLoading = true;

    // Gọi 4 API song song, chờ tất cả xong mới xử lý
    forkJoin({
      summary: this.dashboardService.getSummary(), //Cho Line Chart
      auditByDay: this.dashboardService.getAuditByDay(7, this.fromDate, this.toDate), //Cho Bar Chart
      booksByCategory: this.dashboardService.getBooksByCategory(),
      usersByRole: this.dashboardService.getUsersByRole()   // [MỚI]
    }).subscribe(
      results => {
        this.summary = results.summary;
        this.auditByDay = results.auditByDay;
        this.booksByCategory = results.booksByCategory;
        this.usersByRole = results.usersByRole;
        this.isLoading = false; //Khi tải xong đặt isLoading = False;
        this.dataReady = true;

        // Nếu view đã render → vẽ chart ngay
        if (this.viewReady) {
          setTimeout(() => this.renderCharts(), 0); //Gọi hàm renderCharts để vẽ
        }
      }
      // Không cần error handler — ErrorInterceptor tự hiện Toast
    );
  }

  // ── Render Charts (lần đầu) ────────────────────────────────────────────

  private renderCharts(): void {
    this.renderLineChart(); //Vẽ biểu đồ đường
    this.renderBarChart(); //Vẽ biểu dồ cột
  }

  // ── LINE CHART: Audit Log theo ngày ───────────────────────────────────

  private renderLineChart(): void {
    const canvas = document.getElementById('lineChart') as HTMLCanvasElement; //lấy canvas có lineChart
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.lineChart) { this.lineChart.destroy(); } //Nếu có line chart cũ thì phá nó đi

    this.lineChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.auditByDay.map(d => d.date), //trục ngang mảng các ngày,
        // auditByDay được lấy từ forkjoin, //duyệt qua từng phần tử và lấy thuộc tính date
        datasets: [{
          label: 'Số thao tác',
          data: this.auditByDay.map(d => d.count), //Trục dọc mảng số lượng thao tác
          borderColor: 'rgba(99, 102, 241, 1)', //Màu đường kẻ
          backgroundColor: 'rgba(99, 102, 241, 0.10)',//Màu bóng mờ
          pointBackgroundColor: 'rgba(99, 102, 241, 1)', //Màu chấm
          pointBorderColor: '#ffffff', //Màu viền chấm
          pointBorderWidth: 2, //Độ dầy viền chấm
          pointRadius: 5, //Bán kính chấm
          pointHoverRadius: 7, //Bán kính chấm khi di chuột qua
          borderWidth: 2.5, //Độ dầy đường kẻ
          fill: true, //Hiện màu nền phía dưới đường kẻ
          tension: 0.4   // Đường cong mượt
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeInOutQuart' }, //hIỆU ỨNG CHẠY MƯỢT TRONG 600ms
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
      // Nếu chưa có instance thì tạo mới
      this.renderLineChart();
      return;
    }

    //Nạp dữ liệu mới vào biểu đồ hiện tại
    this.lineChart.data.labels = this.auditByDay.map(d => d.date); //Cập nhật lại danh sách các ngày mới vào trục ngang

    /**
     * 
     *  this.lineChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.auditByDay.map(d => d.date), //trục ngang mảng các ngày, 
     * 
     * 
     * 
     */
    this.lineChart.data.datasets[0].data = this.auditByDay.map(d => d.count); //Cập nhật lại số lượng thao tác tương ứng vào trục Y

    /**
     * 
     * data: this.auditByDay.map(d => d.count), //Trục dọc mảng số lượng thao tác
     * 
     */


    this.lineChart.update('active');  // Chart.js tự animate khi update
  }

  // ── BAR CHART: User theo Role ──────────────────────────────────────────

  private renderBarChart(): void {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.barChart) { this.barChart.destroy(); }

    // Màu sắc theo Role
    const roleColors: { [key: string]: string } = {
      'ADMIN': 'rgba(239, 68, 68,  0.80)',   // Đỏ
      'STAFF': 'rgba(59,  130, 246, 0.80)',   // Xanh dương
      'CUSTOMER': 'rgba(16,  185, 129, 0.80)',   // Xanh lá
    };
    const roleBorders: { [key: string]: string } = {
      'ADMIN': 'rgba(239, 68, 68,  1)',
      'STAFF': 'rgba(59,  130, 246, 1)',
      'CUSTOMER': 'rgba(16,  185, 129, 1)',
    };

    const labels = this.usersByRole.map(u => u.roleName);
    const counts = this.usersByRole.map(u => u.count);
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



  // Tổng số thao tác trong khoảng date range hiện tại
  get totalAuditInRange(): number {
    return this.auditByDay.reduce((sum, d) => sum + d.count, 0);  //reduce duyệt qua toàn bộ mảng và cộng dồn
  }

  // Tổng số người dùng từ tất cả role
  get totalUsersFromRoles(): number {
    return this.usersByRole.reduce((sum, r) => sum + r.count, 0);
  }

  // Trạng thái đang xuất PDF (để hiện chữ "Đang tạo PDF..." và khóa nút bấm)
dangTaoPDF = false;

xuatBaoCaoPDF(): void {
  // 1. Tìm phần tử HTML của màn hình Dashboard cần chụp
  const phanTuCanChup = document.getElementById('dashboardReport');
  if (!phanTuCanChup) return;

  this.dangTaoPDF = true; // Bật trạng thái đang xuất

  // 2. Dùng thư viện html2canvas để chụp màn hình HTML thành Canvas
  html2canvas(phanTuCanChup, {
    scale: 2,                  // Tăng độ phân giải lên gấp 2 lần (giúp biểu đồ không bị mờ/vỡ hạt)
    useCORS: true,             // Cho phép tải các icon hoặc hình ảnh từ ngoài vào
    logging: false,            // Tắt ghi log rác trên console
    backgroundColor: '#f8fafc' // Màu nền trắng xám của trang Dashboard
  }).then(canvas => {
    
    // 3. Biến đổi Canvas vừa chụp thành dữ liệu ảnh định dạng PNG
    const duLieuAnh = canvas.toDataURL('image/png');

    // 4. Khởi tạo một trang tài liệu PDF mới
    // 'l': Khổ giấy nằm ngang (Landscape) để vừa vặn chiều rộng của Dashboard
    // 'mm': Đơn vị đo là milimet
    // 'a4': Kích thước khổ giấy chuẩn A4 (297mm x 210mm)
    const tepPDF = new jsPDF('l', 'mm', 'a4');
    
    const chieuRongTrang = tepPDF.internal.pageSize.getWidth();   // 297 mm
    const chieuCaoTrang  = tepPDF.internal.pageSize.getHeight();  // 210 mm

    // 5. Tính toán kích thước ảnh để vừa khít trang giấy (cách lề 10mm mỗi bên)
    const chieuRongAnh = chieuRongTrang - 20; // 297 - 20 = 277 mm
    const chieuCaoAnh  = (canvas.height * chieuRongAnh) / canvas.width; // Giữ đúng tỷ lệ gốc

    // 6. Chèn bức ảnh vào trang PDF (tọa độ x=10mm, y=10mm)
    tepPDF.addImage(duLieuAnh, 'PNG', 10, 10, chieuRongAnh, chieuCaoAnh);

    // 7. Tạo tên file tự động theo khoảng ngày đang chọn và tải về máy
    const tenFile = `BaoCao_Dashboard_${this.fromDate}_den_${this.toDate}.pdf`;
    tepPDF.save(tenFile);

    this.dangTaoPDF = false; // Tắt trạng thái đang xuất
    this.notification.success('Đã tải xuống file báo cáo PDF thành công!', 'Thành công');

  }).catch(loi => {
    console.error('Lỗi trong quá trình xuất PDF:', loi);
    this.dangTaoPDF = false;
    this.notification.error('Không thể xuất file PDF. Vui lòng thử lại.', 'Lỗi');
  });
}

}
