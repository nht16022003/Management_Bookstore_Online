using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.AccountManagement
{
    public class AccountDTO
    {
        public string userName { get; set; }    
        public string hashPassword { get; set; }
        public int id { get; set; }
        public int? id_USER { get; set; }
        public bool status { get; set; }
        public string? accountName { get; set; }
        public string? roleName { get; set; }
        public int? roleId { get; set; }
        public int? userId { get; set; }
    }
}
