using System.Data;
using System.Data.Common;
using ManagementBTOnline_API.Data;
using ManagementBTOnline_API.Models.DashboardManagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
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
        // Tối ưu bằng Raw SQL tổng hợp một lần đếm toàn bộ bảng
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = new DashboardSummaryDTO();

            const string sql = @"
                SELECT 
                    (SELECT COUNT(*) FROM BOOKS) AS TotalBooks,
                    (SELECT COUNT(*) FROM CATEGORIES) AS TotalCategories,
                    (SELECT COUNT(*) FROM USERS) AS TotalUsers,
                    (SELECT COUNT(*) FROM ACCOUNTS) AS TotalAccounts,
                    (SELECT COUNT(*) FROM AuditLogs) AS TotalAuditLogs";

            var conn = _context.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            cmd.CommandType = CommandType.Text;

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                summary.TotalBooks      = reader.GetInt32(0);
                summary.TotalCategories = reader.GetInt32(1);
                summary.TotalUsers      = reader.GetInt32(2);
                summary.TotalAccounts   = reader.GetInt32(3);
                summary.TotalAuditLogs  = reader.GetInt32(4);
            }

            return Ok(summary);
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/Dashboard/audit-by-day
        // Tối ưu bằng Raw SQL có tham số hóa @StartDate và @EndDate
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("audit-by-day")]
        public async Task<IActionResult> GetAuditByDay(
            [FromQuery] int       days     = 7,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate   = null)
        {
            DateTime start;
            DateTime end;

            if (fromDate.HasValue && toDate.HasValue)
            {
                start = fromDate.Value.Date;
                end   = toDate.Value.Date;

                if ((end - start).TotalDays > 90)
                    return BadRequest("Khoảng thời gian không được vượt quá 90 ngày.");

                if (start > end)
                    return BadRequest("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
            }
            else
            {
                start = DateTime.Now.AddDays(-days + 1).Date;
                end   = DateTime.Now.Date;
            }

            var result = await QueryAuditLogsByDayAsync(start, end);
            return Ok(result);
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/Dashboard/books-by-category
        // Tối ưu bằng Raw SQL kết hợp INNER JOIN và GROUP BY
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("books-by-category")]
        public async Task<IActionResult> GetBooksByCategory()
        {
            var result = await QueryBooksByCategoryAsync();
            return Ok(result);
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/Dashboard/users-by-role
        // Tối ưu bằng Raw SQL phân bổ người dùng theo vai trò
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("users-by-role")]
        public async Task<IActionResult> GetUsersByRole()
        {
            var result = await QueryUsersByRoleAsync();
            return Ok(result);
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/Dashboard/master-data
        // [TASK 8] Trả về một JSON response duy nhất tổng hợp cả 4 biểu đồ
        // bằng Raw SQL tối ưu cho Master Filter
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("master-data")]
        public async Task<IActionResult> GetMasterDashboardData(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate   = null)
        {
            DateTime start = fromDate.HasValue ? fromDate.Value.Date : DateTime.Now.AddDays(-6).Date;
            DateTime end   = toDate.HasValue ? toDate.Value.Date : DateTime.Now.Date;

            if (start > end)
                return BadRequest("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");

            if ((end - start).TotalDays > 90)
                return BadRequest("Khoảng thời gian không được vượt quá 90 ngày.");

            // 1. Query Summary qua Raw SQL
            var summary = new DashboardSummaryDTO();
            const string sqlSummary = @"
                SELECT 
                    (SELECT COUNT(*) FROM BOOKS) AS TotalBooks,
                    (SELECT COUNT(*) FROM CATEGORIES) AS TotalCategories,
                    (SELECT COUNT(*) FROM USERS) AS TotalUsers,
                    (SELECT COUNT(*) FROM ACCOUNTS) AS TotalAccounts,
                    (SELECT COUNT(*) FROM AuditLogs) AS TotalAuditLogs";

            var conn = _context.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = sqlSummary;
                cmd.CommandType = CommandType.Text;
                using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    summary.TotalBooks      = reader.GetInt32(0);
                    summary.TotalCategories = reader.GetInt32(1);
                    summary.TotalUsers      = reader.GetInt32(2);
                    summary.TotalAccounts   = reader.GetInt32(3);
                    summary.TotalAuditLogs  = reader.GetInt32(4);
                }
            }

            // 2. Query Audit Log by Day qua Raw SQL có tham số hóa
            var auditByDay = await QueryAuditLogsByDayAsync(start, end);

            // 3. Query Books by Category qua Raw SQL
            var booksByCategory = await QueryBooksByCategoryAsync();

            // 4. Query Users by Role qua Raw SQL
            var usersByRole = await QueryUsersByRoleAsync();

            return Ok(new
            {
                summary,
                auditByDay,
                booksByCategory,
                usersByRole
            });
        }

        // ── Helper Methods thực thi Raw SQL tham số hóa ──────────────────

        private async Task<List<AuditLogByDayDTO>> QueryAuditLogsByDayAsync(DateTime start, DateTime end)
        {
            int totalDays = (int)(end - start).TotalDays + 1;
            var allDays = Enumerable.Range(0, totalDays)
                .Select(i => start.AddDays(i))
                .ToList();

            var logsFromDb = new Dictionary<DateTime, int>();

            const string sql = @"
                SELECT CAST(CreatedAt AS DATE) AS LogDate, COUNT(*) AS TotalCount
                FROM AuditLogs
                WHERE CreatedAt >= @StartDate AND CreatedAt <= @EndDate
                GROUP BY CAST(CreatedAt AS DATE)
                ORDER BY LogDate ASC";

            var conn = _context.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = sql;
                cmd.CommandType = CommandType.Text;

                var pStart = cmd.CreateParameter();
                pStart.ParameterName = "@StartDate";
                pStart.Value = start;
                cmd.Parameters.Add(pStart);

                var pEnd = cmd.CreateParameter();
                pEnd.ParameterName = "@EndDate";
                pEnd.Value = end.AddDays(1).AddTicks(-1);
                cmd.Parameters.Add(pEnd);

                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var date = reader.GetDateTime(0).Date;
                    var count = reader.GetInt32(1);
                    logsFromDb[date] = count;
                }
            }

            return allDays.Select(day => new AuditLogByDayDTO
            {
                Date  = day.ToString("dd/MM"),
                Count = logsFromDb.TryGetValue(day, out var count) ? count : 0
            }).ToList();
        }

        private async Task<List<BookByCategoryDTO>> QueryBooksByCategoryAsync()
        {
            var result = new List<BookByCategoryDTO>();

            const string sql = @"
                SELECT c.CATEGORY_NAME AS CategoryName, COUNT(b.ID_BOOK) AS [Count]
                FROM CATEGORIES c
                INNER JOIN BOOKS b ON c.ID_CATEGORY = b.ID_CATEGORY
                GROUP BY c.CATEGORY_NAME
                HAVING COUNT(b.ID_BOOK) > 0
                ORDER BY [Count] DESC";

            var conn = _context.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = sql;
                cmd.CommandType = CommandType.Text;

                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new BookByCategoryDTO
                    {
                        CategoryName = reader.IsDBNull(0) ? "Không xác định" : reader.GetString(0),
                        Count = reader.GetInt32(1)
                    });
                }
            }

            return result;
        }

        private async Task<List<UserByRoleDTO>> QueryUsersByRoleAsync()
        {
            var result = new List<UserByRoleDTO>();

            const string sql = @"
                SELECT r.ROLE_NAME AS RoleName, COUNT(u.ID_USER) AS [Count]
                FROM USERS u
                INNER JOIN ROLES r ON u.ID_ROLE = r.ID_ROLE
                GROUP BY r.ROLE_NAME
                ORDER BY [Count] DESC";

            var conn = _context.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = sql;
                cmd.CommandType = CommandType.Text;

                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.Add(new UserByRoleDTO
                    {
                        RoleName = reader.IsDBNull(0) ? "Không xác định" : reader.GetString(0),
                        Count = reader.GetInt32(1)
                    });
                }
            }

            return result;
        }
    }
}
