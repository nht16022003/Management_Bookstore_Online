using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Principal;

namespace ManagementBTOnline_API.Models.UsersManagement
{
    [Table("USERS")]
    public class UserModel
    {
        [Key]
       public int ID_USER {  get; set; } 
	   public int ID_ROLE {  get; set; }

       public string USER_NAME { get; set; }
       public int USER_AGE { get; set; }
       public string USER_ADDRESS { get; set; }

       public string USER_PHONE { get; set; }

       public string USER_EMAIL { get; set; }
    }
}
