using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.CategoryManagement
{
    [Table("CATEGORIES")]
    public class CategoryModel
    {
        public int? ID_CATEGORY { get; set; }

        public string? CATEGORY_NAME { get; set; }
    }
}
