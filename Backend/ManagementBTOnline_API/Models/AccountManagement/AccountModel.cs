using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.AccountManagement
{
    [Table("ACCOUNTS")]
    public class AccountModel
    {
        [Key]
        [Column("ID")]
        public int id { get; set; }
        [Column("ID_USER")]
        public int? id_USER { get; set; }
        [Column("USERNAME")]
        public string userName { get; set; }
        [Column("HashPassword")]
        public string hashPassword { get; set; }
        [Column("STATUS")]
        public bool status {  get; set; }
    }
}
