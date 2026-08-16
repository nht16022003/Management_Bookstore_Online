using ManagementBTOnline_API.Data;
using ManagementBTOnline_API.Models.CategoryManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManagementBTOnline_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : Controller
    {
        private readonly ApplicationDBContext _context;

        public CategoryController(ApplicationDBContext context) 
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> getGetogeries()
        {

            var getogeries = await _context.Categories.Select(c => new CategoryDTO
            {
                id_Category = c.id_Category,
                categoryName = c.categoryName

            }).ToListAsync();

            return Ok(getogeries);
        }
    }
}
