using ManagementBTOnline_API.Data;
using ManagementBTOnline_API.Models.AccountManagement;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace ManagementBTOnline_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : Controller
    {
        private readonly ApplicationDBContext _context;

        public AccountController(ApplicationDBContext context)
        {
            _context = context;
        }


        [HttpPost("login")]
        public async Task<IActionResult> getAccount(AccountDTO dto)
        {
            var account = await _context.Accounts.
                FirstOrDefaultAsync(a => a.userName == dto.userName &&
                a.hashPassword == dto.hashPassword);
            if (account == null)
            {
                return Unauthorized("Sai username hoặc password");
            }
            return Ok(account);
        }
    }
}
