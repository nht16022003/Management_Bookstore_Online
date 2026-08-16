using ManagementBTOnline_API.Data;
using ManagementBTOnline_API.Models.BookManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManagementBTOnline_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : Controller
    {
        private readonly ApplicationDBContext _context;

        public BookController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet]

        public async Task<IActionResult> GetBooks()
        {
            var books = await _context.Books.Select(b => new BookDTO
            {
                bookName = b.bookName,
                price = b.price,
                description = b.description,
                imageURL = b.imageURL
            }).ToArrayAsync();
            return Ok(books);
        }
    
    }
}
