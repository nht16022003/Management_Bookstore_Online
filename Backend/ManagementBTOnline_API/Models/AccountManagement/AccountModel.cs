using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.AccountManagement
{
    [Table("ACCOUNTS")]
    public class AccountModel
    {
        public int ID { get; set; }

        public int ID_USER { get; set; }

        public string USERNAME { get; set; }

        public string HashPassword { get; set; }

        public bool STATUS {  get; set; }
    }
}
