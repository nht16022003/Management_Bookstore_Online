using ManagementBTOnline_API.Models.UsersManagement;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.RolesManagement
{
    [Table("ROLES")]
    public class RoleModel
    {
        [Key]
        [Column("ID_ROLE")]
        public int id_Role { get; set; }

        [Column("ROLE_NAME")]
        public string roleName { get; set; }

        //Navigation Property
        public ICollection<UserModel> Users { get; set; } 
        //một role có nhiều users
    }
   
    
}
