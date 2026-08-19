using ManagementBTOnline_API.Data;
using ManagementBTOnline_API.Models.AuditManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace ManagementBTOnline_API.Filters
{
    public class AuditLogFilter : IAsyncActionFilter
    {
        private readonly ApplicationDBContext _context;

        public AuditLogFilter(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task OnActionExecutionAsync(
            ActionExecutingContext context,
            ActionExecutionDelegate next)
        {
            // Cho Controller thực hiện trước
            var executedContext = await next();

            // Nếu xảy ra exception thì không ghi log
            if (executedContext.Exception != null)
            {
                return;
            }

            // Nếu API trả lỗi 400, 401, 403, 404, 500... thì không ghi
            if (executedContext.Result is ObjectResult result)
            {
                if (result.StatusCode.HasValue &&
                    (result.StatusCode < 200 ||
                     result.StatusCode >= 300))
                {
                    return;
                }
            }

            var httpContext = context.HttpContext;

            string method = httpContext.Request.Method;

            // Chỉ ghi POST / PUT / DELETE
            if (method != "POST" &&
                method != "PUT" &&
                method != "DELETE")
            {
                return;
            }

            string controllerName =
                context.RouteData.Values["controller"]?.ToString()
                ?? "";

            string actionName =
                context.RouteData.Values["action"]?.ToString()
                ?? "";

            // Không ghi Login / Register
            if (controllerName == "Account")
            {
                return;
            }

            // =========================
            // Lấy thông tin từ JWT
            // =========================

            string userName =
                httpContext.User
                    .FindFirst(ClaimTypes.Name)?.Value
                ?? "Unknown";

            string? userIdString =
                httpContext.User
                    .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            int? userId = null;

            if (int.TryParse(userIdString, out int id))
            {
                userId = id;
            }

            // =========================
            // Xác định thao tác
            // =========================

            string action = method switch
            {
                "POST" => "CREATE",
                "PUT" => "UPDATE",
                "DELETE" => "DELETE",
                _ => method
            };

            string description = action switch
            {
                "CREATE" =>
                    $"Thêm dữ liệu tại {controllerName}/{actionName}",

                "UPDATE" =>
                    $"Sửa dữ liệu tại {controllerName}/{actionName}",

                "DELETE" =>
                    $"Xóa dữ liệu tại {controllerName}/{actionName}",

                _ => ""
            };

            // =========================
            // Tạo Audit Log
            // =========================

            var auditLog = new AuditLogModel
            {
                UserId = userId,

                UserName = userName,

                Action = action,

                ControllerName = controllerName,

                ActionName = actionName,

                Description = description,

                CreatedAt = DateTime.Now
            };

            _context.AuditLogs.Add(auditLog);

            await _context.SaveChangesAsync();
        }
    }
}