using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.RolesManagement
{
    
    public class RoleDTO
    {
        public int? id_Role { get; set; }    
        public string roleName { get; set; }
    }
}
