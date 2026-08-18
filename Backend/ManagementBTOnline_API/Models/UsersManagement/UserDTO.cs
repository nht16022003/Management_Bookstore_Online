using ManagementBTOnline_API.Models.RolesManagement;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.UsersManagement
{
    public class UserDTO
    {
      
        public int id_User { get; set; }

       
        public int id_Role { get; set; }

        
        public string user_Name { get; set; }

       
        public int user_Age { get; set; }

       
        public string user_Address { get; set; }

      
        public string user_Phone { get; set; }

        
        public string user_Email { get; set; }

       
    }
}
