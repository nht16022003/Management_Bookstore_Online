CÁC NỘI DUNG CẦN HOÀN THIỆN TRONG TUẦN 1
Dưới đây là các đầu mục bạn cần kiểm tra trực tiếp trên máy hoặc source code của từng bạn:
1. Cấu trúc Code & Nền tảng (Kiểm tra từng bạn)
 	Bắt buộc dùng DTO: Yêu cầu mở API Controller xem có trả thẳng Entity (bảng Database) ra ngoài không. Bắt buộc phải có file DTO và bước mapping dữ liệu.
 	Quy tắc đặt tên (Naming Convention): Check ngẫu nhiên các file. Bắt lỗi ngay nếu Angular (TypeScript) viết hoa chữ đầu (PascalCase), hoặc C# lại viết thường chữ đầu (camelCase).
 	Không Hardcode: Bắt mở file DbContext và Controller. Chuỗi kết nối SQL Server và Secret Key JWT tuyệt đối không được viết cứng trong code, phải đọc từ appsettings.json.
2. Thực hành Bảo mật dữ liệu
 	Lưu trữ mật khẩu: Bắt các bạn mở thẳng SQL Server Management Studio (hoặc công cụ xem DB), query bảng User. Cột mật khẩu phải là một chuỗi mã hóa loằng ngoằng (Hash). Ai lưu pass dạng đọc được (plain-text) là yêu cầu làm lại.
 	Gắn Token hợp lệ: Yêu cầu bật F12 (DevTools) trên trình duyệt sang tab Network. Test thử một API cần quyền, kiểm tra xem ở phần Request Headers có chứa dòng Authorization: Bearer <token> chưa.
3. Tương tác với CSDL (EF Core & SQL)
 	Code Bất đồng bộ: Lướt qua các hàm lấy dữ liệu dưới Repository/Service của C#. Bắt buộc 100% phải có từ khóa async, await và dùng các hàm như ToListAsync(), FirstOrDefaultAsync().
 	Hiểu về Load dữ liệu: Yêu cầu mở đoạn code lấy danh sách dữ liệu có liên kết bảng (ví dụ: User kèm theo Role). Hỏi xem bạn đó có dùng .Include() (Eager Loading) không, hay đang để mặc định làm phát sinh lỗi N+1 Query.
4. Trải nghiệm & Bắt lỗi giao diện (Angular)
•	Vòng đời (Lifecycle): Mở thử 1 Component, kiểm tra xem lệnh gọi API lấy dữ liệu đang nằm ở đâu. Bắt buộc phải nằm ở ngOnInit(), nếu viết ở constructor thì yêu cầu dời đi.
 	Mô phỏng sập Server: Yêu cầu bạn đó tắt tạm server .NET (hoặc nhập sai mật khẩu đăng nhập). Giao diện Angular phải bắt được lỗi và hiện thông báo đàng hoàng, tuyệt đối không được trắng trang hay chỉ báo lỗi đỏ dưới tab Console (F12).
5. Kỹ năng làm việc độc lập & Sử dụng AI
 	Vấn đáp tại chỗ: Chỉ ngẫu nhiên một đoạn code cấu hình khó (như cấu hình CORS, AddAuthentication JWT ở file Program.cs) và yêu cầu giải thích luồng chạy. Khuyến khích các em dùng AI (Copilot/Gemini) hỗ trợ viết code, nhưng bắt buộc người code phải hiểu dòng đó làm gì.
 	Lịch sử Git cá nhân: Dù làm một mình cũng phải tập thói quen commit. Mở lịch sử commit lên xem có chia nhỏ theo từng tính năng (vd: “Thêm API Login”, “Dựng UI trang chủ”) không, hay dồn hết vào 1 commit khổng lồ “Update cuối tuần”.
 
TUẦN 2
1. Tối ưu xử lý dữ liệu (Server-side Pagination, Filtering & Sorting)
 	Backend: Chuyển đổi các API lấy danh sách sang nhận tham số (page, size, keyword). Sử dụng IQueryable trong C# để phân trang và lọc trực tiếp dưới SQL Server, tránh lấy toàn bộ dữ liệu lên RAM.
 	Frontend: Cập nhật lại Data Table trên Angular để truyền tham số xuống API khi người dùng chuyển trang, gõ từ khóa tìm kiếm, hoặc bấm sắp xếp cột.
2. Giao diện theo quyền (Role-based UI) & Route Guards
 	Frontend: Triển khai Angular Route Guards (CanActivate) để chặn người dùng truy cập các trang không được phép.
 	Frontend: Dùng directive (ví dụ *ngIf) để ẩn/hiện các nút chức năng (Thêm, Sửa, Xóa) trên giao diện tương ứng với Role của user đang đăng nhập.
3. Triển khai tính năng Lưu vết hệ thống (Audit Logging)
 	Backend: Tận dụng thông tin User vừa đăng nhập, viết cơ chế (gợi ý: EF Core Interceptors hoặc Action Filters) để tự động ghi log vào bảng AuditLogs mỗi khi có ai đó Thêm/Sửa/Xóa dữ liệu (Lưu lại: Ai làm, làm gì, lúc nào).
 	Frontend & DB: Tạo bảng lưu log trong SQL và dựng màn hình “Lịch sử hoạt động” (chỉ cho phép Role Admin xem).
4. Xử lý File (Upload hình ảnh / tài liệu)
 	Backend: Viết API nhận file qua kiểu IFormFile (Multipart/form-data), kiểm tra định dạng/kích thước file, và lưu trữ vào thư mục dự án (hoặc database).
 	Frontend: Xây dựng component chọn file, gọi API upload và xử lý hiển thị thanh tiến trình (Upload Progress) để người dùng biết phần trăm đã tải lên.
5. Chuẩn hóa Xử lý lỗi (Exception Handling & Notifications)
 	Backend: Thiết lập Global Exception Handling Middleware trong .NET để gom tất cả lỗi (500, 400, 404) về một format JSON chuẩn trước khi trả cho Frontend.
 	Frontend: Cấu hình Angular HttpInterceptor để bắt các mã lỗi này và hiển thị thông báo dạng Toast/Snackbar đẹp mắt thay vì dùng alert() mặc định của trình duyệt. Tự động chuyển hướng về trang Login nếu token hết hạn (401 Unauthorized).
