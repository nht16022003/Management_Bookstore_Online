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
            /*
                  var account = await _context.Accounts.
                FirstOrDefaultAsync(a => a.userName == dto.userName &&
                a.hashPassword == dto.hashPassword);
             */


            var result = await (
                    from a in _context.Accounts
                    join u in _context.Users
                        on a.id_USER equals u.ID_USER
                    join d in _context.Roles
                        on u.ID_ROLE equals d.id_Role
                    where a.userName == dto.userName
                        && a.hashPassword == dto.hashPassword
                    select new AccountDTO
                    {
                        userName = u.USER_NAME,
                        id = a.id,
                        id_USER = u.ID_USER, 
                        status = a.status, 
                        accountName = a.userName,
                        roleName = d.roleName, 
                        userId = u.ID_USER
                    }
                ).FirstOrDefaultAsync(); 

            if (result == null)
            {
                return Unauthorized("Sai username hoặc password");
            }
            
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
            return Ok(result);
        }


    }
}
