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
                imageURL = b.imageURL,
                quantity = b.quantity
            }).ToArrayAsync();

            var result = await (
                from c in _context.Categories
                join b in _context.Books on c.id_Category equals b.id_Category
                select new BookDTO
                {
                    bookName = b.bookName,

                    price = b.price,

                    description = b.description,

                    imageURL = b.imageURL,

                    quantity = b.quantity,

                    id_Category = c.id_Category,

                    category_Name = c.categoryName
                }
                ).ToArrayAsync();

            var data = await _context.Books.Include(b => b.Category).Select(b => new BookDTO
            {
                bookName = b.bookName,
                price = b.price,
                description = b.description,
                imageURL = b.imageURL,
                quantity = b.quantity,
                id_Category = b.Category.id_Category,
                category_Name = b.Category.categoryName,
            }).ToArrayAsync();
                
                /*
                 var result = await (
                  from a in _context.TableA

                  join b in _context.TableB
                      on a.KeyA equals b.KeyB

                  join c in _context.TableC
                      on b.KeyB2 equals c.KeyC

                  where  điều kiện nếu có 

                          select new MyDTO
                          {
                              Property1 = a.Column1,
                              Property2 = b.Column2,
                              Property3 = c.Column3
                          }
              ).ToListAsync();*/

            return Ok(data);
        }

        [HttpGet("Cau1")]

        public async Task<IActionResult> getBooks(int page = 1, int size = 8, string? keyword = null)
        {
            //page - đang xem trang nào
            //size - mỗi trang bao nhiêu sách
            //keyword - từ khóa tìm kiếm
            //GET /api/Book?page=2&size=10&keyword=Harry

            IQueryable<BookModel> query = _context.Books;

            //Thêm Filtering
            if (!string.IsNullOrEmpty(keyword)){
                query = query.Where(b => b.bookName.Contains(keyword));
            }

            //Đếm tổng số dữ liệu (số sách)
            var totalItems = await query.CountAsync(); //lấy số lượng sách đã lọc hoặc chưa lọc

            //Thêm Pagination
            var books = await query.
                Skip((page - 1) * size).//nếu page 2 thì skip(8) tức lấy từ cuốn thứ 9 
                Take(size).
                Select(b => new BookDTO
                {
                    bookName = b.bookName,
                    price = b.price,
                    description = b.description,
                    imageURL = b.imageURL,
                    quantity = b.quantity,
                    id_Category = b.Category.id_Category,
                    category_Name = b.Category.categoryName,
                }).
                ToListAsync();
            //Skip((1-1)*8) = skip(0) không bỏ cuốn nào lấy từ cuốn đầu
            //Take(8) lấy 8  
            return Ok(new
            {
                books,
                totalItems,
                page,
                size

            });
        }

    }
}
