using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.CategoryManagement
{
    [Table("CATEGORIES")]
    public class CategoryModel
    {
        [Key]
        public string? ID_CATEGORY { get; set; }

        public string? CATEGORY_NAME { get; set; }
    }
}
