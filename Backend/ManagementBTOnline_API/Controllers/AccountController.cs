using ManagementBTOnline_API.Data;
using ManagementBTOnline_API.Models.AccountManagement;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Xml;


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

            /*
                var data = await _context.EntityChinh
                .Include(x => x.EntityLienQuan)
                .ToListAsync();

             */
            var data = await _context.Accounts.Include(x => x.User).ThenInclude(b => b.Role).
                Where(x => x.userName == dto.userName && x.hashPassword == dto.hashPassword)
                .Select(x => new AccountDTO
                {
                    userName = x.User.user_Name,
                    id = x.id,
                    id_USER = x.User.id_User,
                    status = x.status,
                    accountName = x.userName,
                    roleName = x.User.Role.roleName, 
                    userId = x.User.id_User,
                }).FirstOrDefaultAsync();
                

            var result = await (
                    from a in _context.Accounts
                    join u in _context.Users
                        on a.id_USER equals u.id_User
                    join d in _context.Roles
                        on u.id_Role equals d.id_Role
                    where a.userName == dto.userName
                        && a.hashPassword == dto.hashPassword
                    select new AccountDTO
                    {
                        userName = u.user_Name,
                        id = a.id,
                        id_USER = u.id_User, 
                        status = a.status, 
                        accountName = a.userName,
                        roleName = d.roleName, 
                        userId = u.id_User
                    }
                ).FirstOrDefaultAsync(); 

            if (data == null)
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
            return Ok(data);
        }


    }
}
