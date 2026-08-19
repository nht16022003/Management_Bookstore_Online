using ManagementBTOnline_API.Models.CategoryManagement;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.BookManagement
{
    [Table("BOOKS")]
    public class BookModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("ID_BOOK")]
        public int? id_Book { get; set; }
        [Column("BOOK_NAME")]
        public string bookName { get; set; }
        [Column("PRICE")]
        public decimal? price { get; set; }
        [Column("ID_CATEGORY")]
        public string? id_Category { get; set; }
        [Column("DESCRIPTION")]
        public string? description { get; set; }
        [Column("IMAGE_URL")]
        public string? imageURL { get; set; }
        [Column("QUANTITY")]
        public int? quantity { get; set; }

        public CategoryModel Category { get; set; }
    }
}
