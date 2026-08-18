using ManagementBTOnline_API.Data;
using ManagementBTOnline_API.Models.AccountManagement;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Xml;
using Microsoft.AspNetCore.Identity;
using ManagementBTOnline_API.Models.RegisterManagement;
using ManagementBTOnline_API.Models.UsersManagement; // dùng để hashPassword


namespace ManagementBTOnline_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : Controller
    {
        private readonly ApplicationDBContext _context;
        private readonly PasswordHasher<AccountModel> _passwordHasher
            = new PasswordHasher<AccountModel>();

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
                Where(x => x.userName == dto.userName)
               .FirstOrDefaultAsync(); //Tìm account 

            var passwordHasher = new PasswordHasher<AccountModel>();

            var passwordResult = passwordHasher.VerifyHashedPassword(
                data,
                data.hashPassword,
                dto.hashPassword
                );
                
            if (passwordResult == PasswordVerificationResult.Failed)
            {
                return Unauthorized("Sai tài khoản hoặc mật khẩu");
            }

            var result = new AccountDTO
            {
                userName = data.User.user_Name,
                id = data.id,
                id_USER = data.User.id_User,
                status = data.status,
                accountName = data.userName, 
                roleName = data.User.Role.roleName,
                userId = data.User.id_User
            };

            //var result = await (
            //        from a in _context.Accounts
            //        join u in _context.Users
            //            on a.id_USER equals u.id_User
            //        join d in _context.Roles
            //            on u.id_Role equals d.id_Role
            //        where a.userName == dto.userName
            //            && a.hashPassword == dto.hashPassword
            //        select new AccountDTO
            //        {
            //            userName = u.user_Name,
            //            id = a.id,
            //            id_USER = u.id_User, 
            //            status = a.status, 
            //            accountName = a.userName,
            //            roleName = d.roleName, 
            //            userId = u.id_User
            //        }
            //    ).FirstOrDefaultAsync(); 

            //if (data == null)
            //{
            //    return Unauthorized("Sai username hoặc password");
            //}
            
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

        [HttpPost("register")]
        public async Task<IActionResult> registerAccount(RegisterDTO dto)
        {

            //Lưu vào Users trước cho có dữ liệu Users 
            var user = new UserModel()
            {
                id_Role = dto.id_Role,
                user_Name = dto.user_Name,
                user_Age = dto.user_Age,
                user_Address = dto.user_Address,
                user_Phone = dto.user_Phone,
                user_Email = dto.user_Email,
                
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var account = new AccountModel();
            account.id_USER = user.id_User;
            account.userName = dto.userName;

            account.hashPassword = _passwordHasher.HashPassword(
                account, dto.hashPassword);
            account.status = dto.status;

            //Dùng AccountDTO để return về cho angular để tránh lỗi vòng lặp do navigate property ACCOUNT -> USER -> ACOUNT -> USER 
            var accountDTO = new AccountDTO()
            {
                userName = account.userName,
                hashPassword = account.hashPassword, 
                id_USER = account.id_USER, 
                status = account.status,
            };

            
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return Ok(accountDTO);
        }
            

    }
}
