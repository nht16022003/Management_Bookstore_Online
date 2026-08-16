using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.RolesManagement
{
    [Table("ROLES")]
    public class RoleModel
    {
        [Key]
        public int ID_ROLE { get; set; }
        public string ROLE_NAME { get; set; }
    }
   
    
}
