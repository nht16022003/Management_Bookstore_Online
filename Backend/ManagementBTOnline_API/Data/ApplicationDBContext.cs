using ManagementBTOnline_API.Models.AccountManagement;
using ManagementBTOnline_API.Models.RolesManagement;
using ManagementBTOnline_API.Models.UsersManagement;
using Microsoft.EntityFrameworkCore;

namespace ManagementBTOnline_API.Data
{
    public class ApplicationDBContext:DbContext
    {
      
        public ApplicationDBContext(
           DbContextOptions<ApplicationDBContext> options)
           : base(options)
        {
        }

        public DbSet<RoleModel> Roles { get; set; }
        //Roles sẽ đại diện cho bảng ROLES để truy vấn

        public DbSet<AccountModel>Accounts {  get; set; }

        public DbSet<UserModel>Users { get; set; }
    }
}
