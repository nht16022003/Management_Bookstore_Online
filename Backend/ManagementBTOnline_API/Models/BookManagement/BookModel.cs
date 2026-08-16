using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.BookManagement
{
    [Table("BOOKS")]
    public class BookModel
    {
        [Key]
        public int? ID_BOOK { get; set; }   

        public string BOOK_NAME { get; set; }

        public decimal? PRICE { get; set; }

        public string? ID_CATEGORY { get; set; }

        public string? DESCRIPTION { get; set; }

        public string? IMAGE_URL { get; set; }
    }
}
