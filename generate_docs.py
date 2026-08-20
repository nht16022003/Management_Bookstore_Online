import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_code_block(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F4F5F7")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    # Border
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/><w:left w:val="single" w:sz="18" w:space="0" w:color="0284C7"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/><w:right w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(code_text)
    run.font.name = "Consolas"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(30, 41, 59)
    doc.add_paragraph()

def add_callout(doc, text, title="LƯU Ý QUAN TRỌNG", box_type="info"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    
    bg_color = "EFF6FF" if box_type == "info" else "FEF3C7"
    border_color = "3B82F6" if box_type == "info" else "F59E0B"
    title_color = RGBColor(29, 78, 216) if box_type == "info" else RGBColor(180, 83, 9)
    
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="none"/><w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/><w:bottom w:val="none"/><w:right w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    r_title = p.add_run(f"📌 {title}\n")
    r_title.bold = True
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(10.5)
    r_title.font.color.rgb = title_color
    
    r_body = p.add_run(text)
    r_body.font.name = "Calibri"
    r_body.font.size = Pt(10)
    r_body.font.color.rgb = RGBColor(31, 41, 55)
    doc.add_paragraph()

def create_full_document(output_path):
    doc = docx.Document()
    
    # Page setup
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)
    
    # Set default style font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = RGBColor(31, 41, 55)
    
    # -------------------------------------------------------------
    # COVER TITLE
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(10)
    title_p.paragraph_format.space_after = Pt(4)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = title_p.add_run("TÀI LIỆU HƯỚNG DẪN & GIẢI THÍCH TOÀN DIỆN SOURCE CODE\n")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(12)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(2, 132, 199)
    
    run_title = title_p.add_run("DỰ ÁN QUẢN LÝ NHÀ SÁCH ONLINE (MANAGEMENT BOOKSTORE ONLINE)\nKIẾN TRÚC .NET CORE WEB API & ANGULAR SPA")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(18)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)
    
    desc_p = doc.add_paragraph()
    desc_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    desc_p.paragraph_format.space_after = Pt(20)
    run_desc = desc_p.add_run("Giải thích chi tiết toàn bộ các câu hỏi Tuần 1 & Tuần 2 trong file readme.md\nĐối chiếu trực tiếp mã nguồn Frontend - Backend, phân tích cơ chế và luồng dữ liệu (Flow)")
    run_desc.italic = True
    run_desc.font.size = Pt(10.5)
    run_desc.font.color.rgb = RGBColor(100, 116, 139)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    # Helper to add section headers
    def add_h1(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(15)
        r.bold = True
        r.font.color.rgb = RGBColor(3, 105, 161)
        return h

    def add_h2(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(13)
        r.bold = True
        r.font.color.rgb = RGBColor(30, 41, 59)
        return h

    def add_h3(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(2)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(11.5)
        r.bold = True
        r.font.color.rgb = RGBColor(71, 85, 105)
        return h

    # -------------------------------------------------------------
    # PHẦN 1: TỔNG QUAN KIẾN TRÚC
    # -------------------------------------------------------------
    add_h1("PHẦN 1: TỔNG QUAN KIẾN TRÚC DỰ ÁN & MÔ HÌNH HOẠT ĐỘNG")
    
    p = doc.add_paragraph()
    p.add_run("Dự án ")
    r_b = p.add_run("Management Bookstore Online")
    r_b.bold = True
    p.add_run(" được xây dựng theo mô hình kiến trúc phân tách rõ ràng (Decoupled Architecture) giữa ")
    r_fe = p.add_run("Frontend (Client-side)")
    r_fe.bold = True
    p.add_run(" và ")
    r_be = p.add_run("Backend (Server-side)")
    r_be.bold = True
    p.add_run(" thông qua giao thức chuẩn RESTful API:")
    
    bullet_items = [
        ("Backend (.NET 9 / ASP.NET Core Web API): ", "Đóng vai trò máy chủ xử lý nghiệp vụ, xác thực người dùng (JWT Authentication), tương tác cơ sở dữ liệu qua Entity Framework Core 9 (Code-first/Database-first), hỗ trợ tải lên file tĩnh (Static Files) và chuẩn hóa xử lý lỗi qua Global Middleware."),
        ("Frontend (Angular): ", "Đóng vai trò ứng dụng đơn trang (SPA - Single Page Application), xây dựng giao diện người dùng theo chuẩn Component-based, quản lý Router, sử dụng HttpInterceptor để tự động đính kèm Token và bắt lỗi toàn cục, hiển thị thông báo với Toastr."),
        ("Database (SQL Server): ", "Lưu trữ dữ liệu có cấu trúc: Users, Roles, Accounts, Books, Categories, AuditLogs."),
        ("Giao tiếp (HTTP/JSON + JWT): ", "Frontend gửi yêu cầu HTTP (GET, POST, PUT, DELETE) mang theo Payload dạng JSON. Backend phản hồi dữ liệu JSON cùng các mã trạng thái HTTP chuẩn (200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).")
    ]
    for b_title, b_desc in bullet_items:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_before = Pt(2)
        bp.paragraph_format.space_after = Pt(2)
        r1 = bp.add_run(b_title)
        r1.bold = True
        bp.add_run(b_desc)

    # -------------------------------------------------------------
    # PHẦN 2: NỘI DUNG CHI TIẾT TUẦN 1
    # -------------------------------------------------------------
    add_h1("PHẦN 2: GIẢI THÍCH NỘI DUNG TUẦN 1 TRONG README.MD")
    
    # 1. Cấu trúc Code & Nền tảng
    add_h2("1. Cấu trúc Code & Nền tảng")
    
    add_h3("1.1. Bắt buộc dùng DTO (Data Transfer Object) và Mapping dữ liệu")
    p = doc.add_paragraph()
    p.add_run("• Lý thuyết chuyên sâu: ")
    p.add_run("Entity là lớp đại diện ánh xạ 1-1 với cấu trúc bảng trong CSDL (chứa thông tin nội bộ, khóa ngoại, mật khẩu băm hashPassword, hoặc các Navigation Property liên kết bảng như Account <-> User). Nếu Controller trả thẳng Entity ra ngoài sẽ gây ra các hậu quả cực kỳ nghiêm trọng:\n")
    p.add_run("   1. Lộ lọt dữ liệu nhạy cảm (hashPassword, thông tin admin).\n")
    p.add_run("   2. Lỗi chu kỳ tuần hoàn (Circular Reference / JSON Cycle Exception): Do AccountModel chứa biến User, còn UserModel lại chứa biến Account. Khi thư viện JSON serialize sẽ chạy lặp vô tận và sập API.\n")
    p.add_run("   3. Over-fetching / Under-fetching: Gửi dư thừa hoặc thiếu trường dữ liệu mà Frontend thực sự cần.\n")
    p.add_run("• Giải pháp DTO: Tạo các class trung gian (chỉ chứa dữ liệu cần trao đổi) và thực hiện mapping (chuyển đổi) dữ liệu từ Entity sang DTO trước khi trả về Frontend.")
    
    p = doc.add_paragraph()
    p.add_run("• Đối chiếu Source Code thực tế:")
    
    add_code_block(doc, """// [BACKEND] BookController.cs - Đoạn code Map từ BookModel sang BookDTO
[HttpGet]
public async Task<IActionResult> GetBooks()
{
    var data = await _context.Books
        .Include(b => b.Category)
        .Select(b => new BookDTO
        {
            bookName = b.bookName,
            price = b.price,
            description = b.description,
            imageURL = b.imageURL,
            quantity = b.quantity,
            id_Category = b.Category.id_Category,
            category_Name = b.Category.categoryName,
        }).ToArrayAsync();

    return Ok(data);
}

// [BACKEND] AccountController.cs - Khi Đăng ký & Đăng nhập cũng dùng AccountDTO
var accountDTO = new AccountDTO()
{
    userName = account.userName,
    hashPassword = account.hashPassword, 
    id_USER = account.id_USER, 
    status = account.status,
};
return Ok(accountDTO);""")

    add_code_block(doc, """// [FRONTEND] BookModel.ts - Model tương ứng trên Angular hứng đúng DTO
export interface BookModel {
    id_Book: number;
    bookName: string;
    price: number;
    description: string;
    imageURL: string;
    quantity: number;
    id_Category: string;
    category_Name: string;
}""")

    add_h3("1.2. Quy tắc đặt tên (Naming Convention)")
    p = doc.add_paragraph()
    p.add_run("Quy chuẩn đặt tên thống nhất giữa hai nền tảng:\n")
    p.add_run("• Phía C# / .NET:\n")
    p.add_run("   - Class, Struct, Interface, Method, Property: Sử dụng PascalCase (Ví dụ: BookController, ApplicationDBContext, GetBooks(), BookModel).\n")
    p.add_run("   - Private fields: Sử dụng _camelCase (Ví dụ: _context, _configuration, _passwordHasher).\n")
    p.add_run("   - Tham số hàm: camelCase (Ví dụ: dto, page, size, keyword).\n")
    p.add_run("• Phía Angular / TypeScript:\n")
    p.add_run("   - Class, Component, Interface, Module: Sử dụng PascalCase (Ví dụ: ListProductComponent, BookService, AuthGuard).\n")
    p.add_run("   - Biến, hàm, thuộc tính đối tượng: Sử dụng camelCase (Ví dụ: getBooks(), uploadProgress, selectedFile).\n")
    p.add_run("   - Tên file: Sử dụng kebab-case (Ví dụ: book.service.ts, auth.interceptor.ts, list-product.component.html).")

    add_h3("1.3. Không Hardcode cấu hình (Đọc từ appsettings.json)")
    p = doc.add_paragraph()
    p.add_run("• Lý thuyết: Tuyệt đối không viết cứng chuỗi kết nối CSDL (Connection String) và khóa bí mật JWT (Secret Key) trong code để bảo mật và cho phép chuyển đổi môi trường cấu hình linh hoạt (Dev, Staging, Prod).")
    
    add_code_block(doc, """// [BACKEND] appsettings.json - Cấu hình tập trung
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=DESKTOP-ELVSU52\\\\SQLEXPRESS;Database=MANAGEMENT_BOOKSTORE_ONLINE;User Id=sa;Password=123456;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "ThisIsMySecretKeyForBookStore123456789",
    "Issuer": "ManagementBTOnline",
    "Audience": "ManagementBTOnlineFrontend"
  }
}

// [BACKEND] Program.cs - Đọc cấu hình động qua IConfiguration
builder.Services.AddDbContext<ApplicationDBContext>(options => {
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Đọc Key JWT
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!));""")

    # 2. Thực hành Bảo mật dữ liệu
    add_h2("2. Thực hành Bảo mật dữ liệu")
    
    add_h3("2.1. Lưu trữ mật khẩu an toàn (Password Hashing)")
    p = doc.add_paragraph()
    p.add_run("• Lý thuyết: Tuyệt đối không lưu mật khẩu dạng Plain Text trong Database. Khi CSDL bị rò rỉ, hacker sẽ có toàn bộ thông tin đăng nhập của người dùng. Dự án sử dụng ")
    r_pbkdf2 = p.add_run("PasswordHasher<AccountModel>")
    r_pbkdf2.bold = True
    p.add_run(" của ASP.NET Core Identity. Thuật toán này băm mật khẩu một chiều (One-way Hashing) kết hợp với chuỗi Salt ngẫu nhiên (chống tấn công Rainbow Table).\n")
    p.add_run("• Cơ chế hoạt động:\n")
    p.add_run("   - Đăng ký: Băm mật khẩu người dùng nhập thành chuỗi Hash loằng ngoằng và lưu vào cột hashPassword của bảng Accounts.\n")
    p.add_run("   - Đăng nhập: Lấy chuỗi hash từ CSDL ra, dùng VerifyHashedPassword để kiểm tra tính khớp đúng.")

    add_code_block(doc, """// [BACKEND] AccountController.cs - Mã hóa khi đăng ký và kiểm tra khi đăng nhập
// 1. Khi Đăng ký:
account.hashPassword = _passwordHasher.HashPassword(account, dto.hashPassword);

// 2. Khi Đăng nhập:
var passwordResult = _passwordHasher.VerifyHashedPassword(
    data,
    data.hashPassword,
    dto.hashPassword
);
if (passwordResult == PasswordVerificationResult.Failed)
{
    return Unauthorized("Sai tài khoản hoặc mật khẩu");
}""")

    add_h3("2.2. Gắn Token hợp lệ (JWT Bearer Token Flow)")
    p = doc.add_paragraph()
    p.add_run("• Luồng hoạt động (Flow):\n")
    p.add_run("   Bước 1: Người dùng nhập tài khoản/mật khẩu trên Angular LoginPage.\n")
    p.add_run("   Bước 2: Angular gọi API POST /api/Account/login.\n")
    p.add_run("   Bước 3: Backend kiểm tra hợp lệ, tạo JWT chứa các Claims (UserId, UserName, Role) được ký số bằng Jwt:Key và trả về JSON { result, token }.\n")
    p.add_run("   Bước 4: Frontend lưu token vào localStorage qua AuthService.\n")
    p.add_run("   Bước 5: Với mọi HTTP request sau đó, Angular AuthInterceptor tự động trích xuất token từ localStorage và gắn vào Header: Authorization: Bearer <token>.\n")
    p.add_run("   Bước 6: Backend xác thực chữ ký token trước khi cho phép vào các API được bảo vệ.")

    add_code_block(doc, """// [BACKEND] AccountController.cs - Hàm sinh JWT Token
private string GenerateJwtToken(AccountDTO account)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, account.userId.ToString()),
        new Claim(ClaimTypes.Name, account.userName),
        new Claim(ClaimTypes.Role, account.roleName)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddHours(2),
        signingCredentials: credentials
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}""")

    add_code_block(doc, """// [FRONTEND] auth.interceptor.ts - Tự động đính kèm Header Authorization
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler) {
        const token = localStorage.getItem('token');
        if (token) {
            const authRequest = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return next.handle(authRequest);
        }
        return next.handle(request);
    }
}""")

    # 3. Tương tác CSDL
    add_h2("3. Tương tác với CSDL (EF Core & SQL)")
    
    add_h3("3.1. Code Bất đồng bộ (Async / Await)")
    p = doc.add_paragraph()
    p.add_run("• Lý thuyết: Trong ASP.NET Core, mỗi request được phục vụ bởi một luồng (Thread) trong Thread Pool. Nếu dùng hàm đồng bộ (ToList, SaveChanges), luồng đó sẽ bị 'treo cứng' (blocking) chờ CSDL phản hồi I/O. Lập trình bất đồng bộ với ")
    p.add_run("async / await").bold = True
    p.add_run(" cùng các hàm ")
    p.add_run("ToListAsync(), FirstOrDefaultAsync(), SaveChangesAsync()").bold = True
    p.add_run(" giúp giải phóng Thread quay lại phục vụ request khác trong lúc Database đang truy vấn dữ liệu, giúp Web Server tăng khả năng chịu tải (High Throughput) gấp nhiều lần.")

    add_h3("3.2. Hiểu về Load dữ liệu & Tránh lỗi N+1 Query (Eager Loading)")
    p = doc.add_paragraph()
    p.add_run("• Lỗi N+1 Query: Xảy ra khi bạn truy vấn lấy 1 danh sách N bản ghi (1 query), sau đó trong vòng lặp bạn lại truy vấn bảng liên quan (N queries phụ) -> Tổng cộng sinh ra 1 + N câu lệnh SQL xuống CSDL làm chậm và nghẽn hệ thống.\n")
    p.add_run("• Giải pháp Eager Loading: Sử dụng .Include() và .ThenInclude() để Entity Framework Core sinh ra duy nhất ")
    p.add_run("1 câu lệnh SQL JOIN").bold = True
    p.add_run(" gom tất cả bảng liên quan.")

    add_code_block(doc, """// [BACKEND] AccountController.cs - Sử dụng Eager Loading kết hợp ThenInclude
var data = await _context.Accounts
    .Include(x => x.User)
        .ThenInclude(b => b.Role)
    .Where(x => x.userName == dto.userName)
    .FirstOrDefaultAsync();

// [BACKEND] BookController.cs - Load Book kèm Category
var data = await _context.Books
    .Include(b => b.Category)
    .Select(...)
    .ToArrayAsync();""")

    # 4. Trải nghiệm & Bắt lỗi giao diện
    add_h2("4. Trải nghiệm & Bắt lỗi giao diện (Angular)")
    
    add_h3("4.1. Vòng đời Component (Lifecycle): ngOnInit() vs constructor()")
    p = doc.add_paragraph()
    p.add_run("• constructor(): Là hàm khởi tạo mặc định của class TypeScript, chạy ngay khi instance được tạo. Lúc này giao diện (DOM) và các Input binding của Angular chưa được dựng xong. Chỉ dùng constructor cho mục đích Dependency Injection (Inject Services, Router).\n")
    p.add_run("• ngOnInit(): Là lifecycle hook chính của Angular, chạy khi component đã sẵn sàng và binding xong dữ liệu. Đây là vị trí chuẩn bắt buộc để gọi API lấy dữ liệu ban đầu.")

    add_code_block(doc, """// [FRONTEND] list-product.component.ts
constructor(
    private bookService: BookService,
    private router: Router
) {
    // CHỈ INJECT SERVICE TẠI ĐÂY, TUYỆT ĐỐI KHÔNG GỌI API TRONG CONSTRUCTOR
}

ngOnInit(): void {
    // VỊ TRÍ CHUẨN GỌI API LOAD DỮ LIỆU
    this.bookService.getBooks(this.page, this.size, this.keyword).subscribe(
        data => {
            this.books = data.books;
            this.totalItems = data.totalItems;
        },
        error => {
            alert("Không load được sách");
        }
    );
}""")

    add_h3("4.2. Mô phỏng sập Server & Bắt lỗi hiển thị giao diện")
    p = doc.add_paragraph()
    p.add_run("• Cơ chế: Khi Server .NET bị tắt hoặc kết nối mạng bị gián đoạn, Angular bắt lỗi thông qua khối error callback của Observable và HttpInterceptor, hiển thị thông báo thân thiện tới người dùng (Toastr notification hoặc trang báo lỗi) thay vì để trắng trang.")

    # 5. Kỹ năng làm việc độc lập
    add_h2("5. Kỹ năng làm việc độc lập & Sử dụng AI")
    
    add_h3("5.1. Luồng cấu hình Middleware Pipeline trong Program.cs")
    p = doc.add_paragraph()
    p.add_run("ASP.NET Core xử lý HTTP Request thông qua một đường ống các Middleware nối tiếp nhau (Pipeline). Thứ tự khai báo trong Program.cs cực kỳ quan trọng:\n")
    p.add_run("1. app.UseStaticFiles(): Xử lý và cho phép truy cập file tĩnh (ảnh đã upload trong wwwroot).\n")
    p.add_run("2. app.UseMiddleware<GlobalExceptionMiddleware>(): Đứng ở ngoài cùng để bọc toàn bộ request và bắt mọi Exception phát sinh.\n")
    p.add_run("3. app.UseCors(\"AngularPolicy\"): Cho phép nhận request từ nguồn http://localhost:4200.\n")
    p.add_run("4. app.UseAuthentication(): Xác thực token (Kiểm tra xem User là ai?). Bắt buộc phải đứng TRƯỚC Authorization.\n")
    p.add_run("5. app.UseAuthorization(): Kiểm tra quyền truy cập (User được phép làm gì?).\n")
    p.add_run("6. app.MapControllers(): Điều hướng request tới đúng Controller và Action.")

    # -------------------------------------------------------------
    # PHẦN 3: NỘI DUNG CHI TIẾT TUẦN 2
    # -------------------------------------------------------------
    add_h1("PHẦN 3: GIẢI THÍCH NỘI DUNG TUẦN 2 TRONG README.MD")
    
    # 1. Tối ưu xử lý dữ liệu
    add_h2("1. Tối ưu xử lý dữ liệu (Server-side Pagination, Filtering & Sorting)")
    
    add_h3("1.1. Backend: IQueryable, Skip, Take & Where")
    p = doc.add_paragraph()
    p.add_run("• Lý thuyết: IQueryable cho phép xây dựng câu lệnh truy vấn động. Khi áp dụng Where, Skip, Take, EF Core không nạp toàn bộ bảng vào RAM mà dịch trực tiếp sang câu lệnh SQL phân trang (OFFSET... FETCH NEXT).")

    add_code_block(doc, """// [BACKEND] BookController.cs - Action Cau1 xử lý phân trang & tìm kiếm phía Server
[HttpGet("Cau1")]
public async Task<IActionResult> getBooks(int page = 1, int size = 8, string? keyword = null)
{
    IQueryable<BookModel> query = _context.Books;

    // 1. Filtering (Tìm kiếm)
    if (!string.IsNullOrEmpty(keyword)) {
        query = query.Where(b => b.bookName.Contains(keyword));
    }

    // 2. Lấy tổng số bản ghi (Count)
    var totalItems = await query.CountAsync();

    // 3. Server-side Pagination (Skip & Take)
    var books = await query
        .Skip((page - 1) * size)
        .Take(size)
        .Select(b => new BookDTO
        {
            id_Book = b.id_Book,
            bookName = b.bookName,
            price = b.price,
            description = b.description,
            imageURL = b.imageURL,
            quantity = b.quantity,
            id_Category = b.Category.id_Category,
            category_Name = b.Category.categoryName,
        })
        .ToListAsync();

    return Ok(new {
        books,
        totalItems,
        page,
        size
    });
}""")

    add_h3("1.2. Frontend: Data Table, Truyền tham số & Phân trang")
    add_code_block(doc, """// [FRONTEND] book.service.ts
getBooks(page: number, size: number, keyword: string) {
    return this.http.get<{
        books: BookModel[],
        totalItems: number,
        page: number,
        size: number
    }>(`https://localhost:44314/api/Book/Cau1?page=${page}&size=${size}&keyword=${keyword}`);
}

// [FRONTEND] list-product.component.ts
get totalPage(): number {
    return Math.ceil(this.totalItems / this.size);
}

changePage(page: number): void {
    if (page < 1 || page > this.totalPage) return;
    this.page = page;
    this.ngOnInit();
}""")

    # 2. Giao diện theo quyền
    add_h2("2. Giao diện theo quyền (Role-based UI) & Route Guards")
    
    add_h3("2.1. Angular Route Guards (CanActivate)")
    p = doc.add_paragraph()
    p.add_run("• Lý thuyết: Ngăn chặn người dùng chưa đăng nhập hoặc không phải Role ADMIN truy cập trái phép vào các URL quản trị (như /listproduct).")

    add_code_block(doc, """// [FRONTEND] auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): boolean {
        const account = this.authService.getAccount();
        if (account == null) {
            this.router.navigate(['/login']);
            return false;
        }
        if (account.roleName != 'ADMIN') {
            this.router.navigate(['/']);
            return false;
        }
        return true;
    }
}

// [FRONTEND] app-routing.module.ts
{
    path: 'listproduct',
    component: ListProductComponent,
    canActivate: [AuthGuard]
}""")

    add_h3("2.2. Directives (*ngIf) ẩn hiện chức năng theo Role")
    p = doc.add_paragraph()
    p.add_run("Trong header.component.html, sử dụng *ngIf='isLoggined()' để ẩn hiện menu Đăng nhập/Đăng xuất, và hiển thị roleName của người dùng hiện tại.")

    # 3. Triển khai Audit Logging
    add_h2("3. Triển khai tính năng Lưu vết hệ thống (Audit Logging)")
    
    add_h3("3.1. Backend: Action Filter (AuditLogFilter) tự động ghi log")
    p = doc.add_paragraph()
    p.add_run("• Lý thuyết: Tận dụng cơ chế Action Filter (IAsyncActionFilter) để chặn bắt các thao tác POST (CREATE), PUT (UPDATE), DELETE (DELETE). Filter tự động đọc thông tin User đăng nhập từ JWT Claims (NameIdentifier, Name), lấy tên Controller, Action và lưu vào bảng AuditLogs trong CSDL.")

    add_code_block(doc, """// [BACKEND] AuditLogFilter.cs
public class AuditLogFilter : IAsyncActionFilter
{
    private readonly ApplicationDBContext _context;
    public AuditLogFilter(ApplicationDBContext context) { _context = context; }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var executedContext = await next(); // Cho Controller thực hiện trước
        if (executedContext.Exception != null) return;

        var httpContext = context.HttpContext;
        string method = httpContext.Request.Method;
        if (method != "POST" && method != "PUT" && method != "DELETE") return;

        string controllerName = context.RouteData.Values["controller"]?.ToString() ?? "";
        string actionName = context.RouteData.Values["action"]?.ToString() ?? "";
        if (controllerName == "Account") return; // Không ghi log Login/Register

        // Lấy thông tin từ JWT
        string userName = httpContext.User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
        string? userIdString = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int? userId = int.TryParse(userIdString, out int id) ? id : null;

        string action = method switch {
            "POST" => "CREATE",
            "PUT" => "UPDATE",
            "DELETE" => "DELETE",
            _ => method
        };

        var auditLog = new AuditLogModel {
            UserId = userId,
            UserName = userName,
            Action = action,
            ControllerName = controllerName,
            ActionName = actionName,
            Description = $"{action} dữ liệu tại {controllerName}/{actionName}",
            CreatedAt = DateTime.Now
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }
}

// [BACKEND] Gắn vào BookController.cs
[ApiController]
[Route("api/[controller]")]
[ServiceFilter(typeof(AuditLogFilter))]
public class BookController : Controller { ... }""")

    add_h3("3.2. Màn hình Lịch sử hoạt động (Frontend & API)")
    p = doc.add_paragraph()
    p.add_run("Backend bảo vệ API bằng [Authorize(Roles = 'ADMIN')]. Frontend có AuditLogService gọi API và AuditLogComponent hiển thị bảng dữ liệu lịch sử thao tác.")

    # 4. Xử lý File
    add_h2("4. Xử lý File (Upload hình ảnh / tài liệu)")
    
    add_h3("4.1. Backend: Nhận IFormFile, kiểm tra kích thước & lưu trữ")
    p = doc.add_paragraph()
    p.add_run("• Quy trình tại FileController.cs:\n")
    p.add_run("   1. Nhận file kiểu IFormFile.\n")
    p.add_run("   2. Kiểm tra dung lượng (giới hạn <= 10MB).\n")
    p.add_run("   3. Kiểm tra định dạng đuôi file (.jpg, .jpeg, .png, .webp).\n")
    p.add_run("   4. Tạo tên file ngẫu nhiên Guid.NewGuid() + extension tránh bị trùng lặp đè file.\n")
    p.add_run("   5. Lưu file vào wwwroot/uploads/images/.\n")
    p.add_run("   6. Trả về fileUrl truy cập tĩnh cho Frontend.")

    add_code_block(doc, """// [BACKEND] FileController.cs
[HttpPost("upload")]
public async Task<IActionResult> Upload(IFormFile file)
{
    if (file == null || file.Length == 0) return BadRequest("Chưa chọn file");
    if (file.Length > 10 * 1024 * 1024) return BadRequest("File không được quá 10MB");

    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!allowedExtensions.Contains(extension)) return BadRequest("Định dạng file không hỗ trợ.");

    var uploadFolder = Path.Combine(_enviroment.WebRootPath, "uploads", "images");
    if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

    var fileName = Guid.NewGuid() + extension;
    var filePath = Path.Combine(uploadFolder, fileName);

    using var stream = new FileStream(filePath, FileMode.Create);
    await file.CopyToAsync(stream);

    var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/images/{fileName}";
    return Ok(new { message = "Upload thành công", fileName = fileName, fileUrl = fileUrl });
}""")

    add_h3("4.2. Frontend: FormData, HttpEventType & Thanh tiến trình (Upload Progress)")
    add_code_block(doc, """// [FRONTEND] file.service.ts - Gửi FormData với reportProgress
uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData, {
        reportProgress: true,
        observe: 'events'
    });
}

// [FRONTEND] file-upload-page.component.ts - Tính toán phần trăm tiến trình
this.fileService.uploadFile(this.selectedFile).subscribe(event => {
    if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((event.loaded / event.total) * 100);
    }
    if (event.type === HttpEventType.Response) {
        this.imageUrl = event.body?.fileUrl || '';
        this.uploadProgress = 100;
    }
});""")

    # 5. Chuẩn hóa Xử lý lỗi
    add_h2("5. Chuẩn hóa Xử lý lỗi (Exception Handling & Notifications)")
    
    add_h3("5.1. Backend: GlobalExceptionMiddleware")
    p = doc.add_paragraph()
    p.add_run("Middleware chặn bắt mọi lỗi chưa được xử lý (Unhandled Exception) và đóng gói thành đối tượng JSON chuẩn hóa:")

    add_code_block(doc, """// [BACKEND] GlobalExceptionMiddleware.cs
public async Task InvokeAsync(HttpContext context)
{
    try {
        await _next(context);
    } catch (Exception ex) {
        await HandleExceptionAsync(context, ex);
    }
}

private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
{
    context.Response.ContentType = "application/json";
    int statusCode = (int)HttpStatusCode.InternalServerError;
    string message = "Đã xảy ra lỗi trên server.";

    if (exception is ArgumentException) {
        statusCode = (int)HttpStatusCode.BadRequest;
        message = exception.Message;
    }

    var response = new {
        statusCode = statusCode,
        message = message,
        error = GetErrorName(statusCode),
        timestamp = DateTime.UtcNow
    };

    context.Response.StatusCode = statusCode;
    await context.Response.WriteAsync(JsonSerializer.Serialize(response));
}""")

    add_h3("5.2. Frontend: ErrorInterceptor & Toastr Notification")
    p = doc.add_paragraph()
    p.add_run("ErrorInterceptor bắt tất cả mã lỗi HTTP (400, 401, 403, 404, 500), hiển thị Toast thông báo đẹp mắt và tự động chuyển về trang Login khi Token hết hạn (401).")

    add_code_block(doc, """// [FRONTEND] error.interceptor.ts
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 400) {
                this.notification.error(error.error?.message || 'Dữ liệu không hợp lệ.', 'Bad Request');
            } else if (error.status === 401) {
                this.notification.warning('Phiên đăng nhập đã hết hạn.', 'Đăng nhập lại');
                localStorage.removeItem('token');
                this.router.navigate(['/login']);
            } else if (error.status === 403) {
                this.notification.error('Bạn không có quyền thực hiện thao tác này.', 'Không có quyền');
            } else if (error.status === 404) {
                this.notification.warning(error.error?.message || 'Không tìm thấy dữ liệu.', 'Not Found');
            } else if (error.status === 500) {
                this.notification.error('Đã xảy ra lỗi trên máy chủ.', 'Server Error');
            }
            return throwError(error);
        })
    );
}""")

    # -------------------------------------------------------------
    # PHẦN 4: BẢNG ÁNH XẠ TOÀN DIỆN FRONTEND - BACKEND
    # -------------------------------------------------------------
    add_h1("PHẦN 4: BẢNG TỔNG HỢP ÁNH XẠ TOÀN DIỆN FRONTEND - BACKEND")
    
    table = doc.add_table(rows=1, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    headers = ["Chức năng / Nhiệm vụ", "Thành phần Backend (.NET)", "Thành phần Frontend (Angular)", "Cơ chế tương tác & API Flow"]
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "0284C7")
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.bold = True
            r.font.name = "Calibri"
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)

    table_data = [
        ("Xác thực Đăng nhập & Sinh JWT", "AccountController.cs (POST /api/Account/login)", "LoginPageComponent, AuthService, AccountService", "FE gửi credentials -> BE hash verify -> sinh JWT Token -> FE lưu localStorage"),
        ("Tự động gán Token vào Request", "Program.cs (AddJwtBearer, UseAuthentication)", "AuthInterceptor (HTTP_INTERCEPTORS)", "FE clone HTTP Request và gán Header Authorization: Bearer <token>"),
        ("Phân trang & Tìm kiếm Sách", "BookController.cs (GET /api/Book/Cau1)", "BookService, ListProductComponent", "FE gửi ?page=&size=&keyword= -> BE dùng IQueryable Skip/Take -> trả JSON phân trang"),
        ("Chặn truy cập trái phép", "AudiLogController.cs [Authorize(Roles='ADMIN')]", "AuthGuard (CanActivate)", "FE check roleName == 'ADMIN', nếu không thỏa mãn chuyển hướng về /login hoặc /"),
        ("Lưu vết hệ thống (Audit Log)", "AuditLogFilter.cs (IAsyncActionFilter), AuditLogModel", "AuditLogService, AuditLogComponent", "Filter tự động ghi vết POST/PUT/DELETE vào bảng AuditLogs; Admin xem lịch sử"),
        ("Tải lên hình ảnh kèm Progress", "FileController.cs (POST /api/File/upload, IFormFile)", "FileService, FileUploadComponent", "FE gửi FormData + observe events -> BE lưu wwwroot -> FE tính % thanh tiến trình"),
        ("Chuẩn hóa xử lý lỗi toàn cục", "GlobalExceptionMiddleware.cs, ErrorResponseModel", "ErrorInterceptor, NotificationService (Toastr)", "BE gom lỗi 400/404/500 thành JSON chuẩn -> FE bắt status hiển thị Toastr"),
    ]

    for row_idx, data_row in enumerate(table_data):
        row = table.add_row()
        bg = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        for col_idx, text in enumerate(data_row):
            cell = row.cells[col_idx]
            cell.text = text
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            for r in p.runs:
                r.font.name = "Calibri"
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_paragraph().paragraph_format.space_after = Pt(15)
    
    # Save document
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    out_dir = r"d:\Thuc Tap\Angular Tutorial\Management_Bookstore_Online\ManagementBTOnline"
    out_file = os.path.join(out_dir, "Tai_Lieu_Giai_Thich_Chi_Tiet_Du_An.docx")
    create_full_document(out_file)
