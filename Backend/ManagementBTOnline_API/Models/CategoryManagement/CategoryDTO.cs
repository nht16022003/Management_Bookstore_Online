using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.CategoryManagement
{
    [Table("CATEGORIES")]
    public class CategoryDTO
    {
        public string? CATEGORY_NAME { get; set; }
    }
}
