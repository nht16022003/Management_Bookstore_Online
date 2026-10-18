using ManagementBTOnline_API.Data;
using ManagementBTOnline_API.Models.DashboardManagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManagementBTOnline_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public DashboardController(ApplicationDBContext context)
        {
            _context = context;
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/Dashboard/summary
        // Trả về tổng số sách, danh mục, người dùng, tài khoản, audit logs
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = new DashboardSummaryDTO
            {
                TotalBooks      = await _context.Books.CountAsync(),
                TotalCategories = await _context.Categories.CountAsync(),
                TotalUsers      = await _context.Users.CountAsync(),
                TotalAccounts   = await _context.Accounts.CountAsync(),
                TotalAuditLogs  = await _context.AuditLogs.CountAsync()
            };

            return Ok(summary);
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/Dashboard/audit-by-day
        //   ?days=7          → N ngày gần nhất (chế độ cũ, fallback)
        //   ?fromDate=yyyy-MM-dd&toDate=yyyy-MM-dd → khoảng ngày tùy chọn
        // Trả về số lượng audit log theo từng ngày — dùng cho Line Chart
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("audit-by-day")]
        public async Task<IActionResult> GetAuditByDay(
            [FromQuery] int       days     = 7,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate   = null)
        {

            //Xác định mốc thời gian
            DateTime start;
            DateTime end;

            if (fromDate.HasValue && toDate.HasValue)
            {
                //Người dùng tự chọn khoảng ngày trên DatePicker
                start = fromDate.Value.Date; //.Date để lấy 00:00:00 
                end   = toDate.Value.Date;

                // Bảo vệ: không cho khoảng quá 90 ngày
                if ((end - start).TotalDays > 90)
                    return BadRequest("Khoảng thời gian không được vượt quá 90 ngày.");

                if (start > end)
                    return BadRequest("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
            }
            else
            {
                //Mặc định lấy N ngày gần nhất (vd là 7 ngày trước đến hôm nay)
                start = DateTime.Now.AddDays(-days + 1).Date;
                end   = DateTime.Now.Date;
            }

            int totalDays = (int)(end - start).TotalDays + 1;

            // Tạo danh sách toàn bộ ngày trong khoảng (kể cả ngày không có log)
            var allDays = Enumerable.Range(0, totalDays)
                .Select(i => start.AddDays(i))
                .ToList();

            // Query audit logs trong khoảng thời gian, group by ngày
            var logsFromDb = await _context.AuditLogs
                .Where(x => x.CreatedAt >= start && x.CreatedAt <= end.AddDays(1).AddTicks(-1))
                .GroupBy(x => x.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync();

            // Left join: đảm bảo ngày không có log vẫn xuất hiện với Count = 0
            var result = allDays.Select(day => new AuditLogByDayDTO
            {
                Date  = day.ToString("dd/MM"),
                Count = logsFromDb.FirstOrDefault(l => l.Date == day)?.Count ?? 0
            }).ToList();

            return Ok(result);
        }

     
        // GET /api/Dashboard/books-by-category
        // Trả về số lượng sách theo từng danh mục
        // Dùng cho biểu đồ tròn (Donut Chart)
     
        [HttpGet("books-by-category")]
        public async Task<IActionResult> GetBooksByCategory()
        {
            var result = await _context.Categories
                .Select(c => new BookByCategoryDTO
                {
                    CategoryName = c.categoryName ?? "Không xác định",
                    Count        = c.Book.Count()
                })
                .Where(x => x.Count > 0)   // Chỉ hiện danh mục có sách
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            return Ok(result);
        }

        
        // GET /api/Dashboard/users-by-role
        // Trả về số lượng người dùng theo từng vai trò
        // Dùng cho Bar Chart phân bổ User
     
        [HttpGet("users-by-role")]
        public async Task<IActionResult> GetUsersByRole()
        {
            var result = await _context.Users
                .Where(u => u.Role != null)          // Chỉ lấy user đã có role
                .GroupBy(u => u.Role.roleName)
                .Select(g => new UserByRoleDTO
                {
                    RoleName = g.Key,
                    Count    = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            return Ok(result);
        }
    }
}
