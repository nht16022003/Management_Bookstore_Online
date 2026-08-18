using ManagementBTOnline_API.Models.AccountManagement;
using ManagementBTOnline_API.Models.RolesManagement;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Principal;

namespace ManagementBTOnline_API.Models.UsersManagement
{
    [Table("USERS")]
    public class UserModel
    {
        [Key]
        [Column("ID_USER")]
       public int id_User {  get; set; }

        [Column("ID_ROLE")]
        public int id_Role {  get; set; }

        [Column("USER_NAME")]
        public string user_Name { get; set; }

        [Column("USER_AGE")]
        public int user_Age { get; set; }

        [Column("USER_ADDRESS")]
        public string user_Address { get; set; }

        [Column("USER_PHONE")]
        public string user_Phone { get; set; }

        [Column("USER_EMAIL")]
        public string user_Email { get; set; }

        public RoleModel Role { get; set; }

        public AccountModel Account { get; set; }
    }
}
