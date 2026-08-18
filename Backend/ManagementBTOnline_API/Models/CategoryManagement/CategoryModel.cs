using ManagementBTOnline_API.Models.BookManagement;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.CategoryManagement
{
    [Table("CATEGORIES")]
    public class CategoryModel
    {
        [Key]
        [Column("ID_CATEGORY")]
        public string? id_Category { get; set; }
        [Column("CATEGORY_NAME")]
        public string? categoryName { get; set; }

        public ICollection<BookModel> Book { get; set; }
    }
}
