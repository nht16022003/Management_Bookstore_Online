using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace ManagementBTOnline_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileController : Controller
    {

        private readonly IWebHostEnvironment _enviroment;

        public FileController(IWebHostEnvironment enviroment)
        {
            _enviroment = enviroment;
        }

        [HttpPost("upload")]

        public async Task<IActionResult> Upload(IFormFile file) //Truyền rì quét từ Frontend vào IFormFile 
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Chua chon file");
            }

            //Gioi han MB
            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest("File khong duoc qua 10MB");
            }

            //Định dạng file cho phép
            var allowedExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

            //Dinh dang file cho phep
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Định dạng file không được hỗ trợ.");
            }

            // Thư mục lưu file
            var uploadFolder = Path.Combine(
                _enviroment.WebRootPath,
                "uploads",
                "images"
            );

            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            // Tạo tên file mới
            var fileName = Guid.NewGuid() + extension;

            var filePath = Path.Combine(
                uploadFolder,
                fileName
            );

            // Lưu file
            using var stream = new FileStream(
                filePath,
                FileMode.Create
            );

            await file.CopyToAsync(stream);

            // URL trả về Angular
            var fileUrl =
                $"{Request.Scheme}://{Request.Host}/uploads/images/{fileName}";

            //Lấy token hiện tại từ header
            var authHeader = Request.Headers["Authorization"].ToString();
            var toKenHienHanh = authHeader.StartsWith("Bearer") ? authHeader.Substring(7) : authHeader;


            //Lấy thông tin tài khoản đăng đang nhập từ JWT Claims
            var taiKhoanHienHanh = new
            {
                userID = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                username = User.FindFirst(ClaimTypes.Name)?.Value,
                role = User.FindFirst(ClaimTypes.Role)?.Value
            };

            return Ok(new
            {
                message = "Upload thành công",
                fileName = fileName,
                fileUrl = fileUrl,
                token = toKenHienHanh,
                taikhoan = taiKhoanHienHanh
            });
        }

    }
}
