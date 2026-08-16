using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.CategoryManagement
{
    [Table("CATEGORIES")]
    public class CategoryDTO
    {
        public string? ID_CATEGORY { get; set; }
        public string? CATEGORY_NAME { get; set; }
    }
}
