using ManagementBTOnline_API.Models.AccountManagement;
using ManagementBTOnline_API.Models.BookManagement;
using ManagementBTOnline_API.Models.CategoryManagement;
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

        public DbSet<CategoryModel> Categories { get; set; }

        public DbSet<BookModel> Books { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AccountModel>().
                HasOne(a => a.User).
                WithOne(u => u.Account)
                .HasForeignKey<AccountModel>(a => a.id_USER);

            modelBuilder.Entity<UserModel>().
                HasOne(a => a.Role).
                WithMany(u => u.Users).
                HasForeignKey(a => a.id_Role);

            modelBuilder.Entity<CategoryModel>().
                HasMany(a => a.Book).
                WithOne(u => u.Category).
                HasForeignKey(a => a.id_Category);

            modelBuilder.Entity<BookModel>().
                HasOne(a => a.Category).
                WithMany(u => u.Book).
                HasForeignKey(a => a.id_Category);
        }
    }
}
