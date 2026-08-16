using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagementBTOnline_API.Models.CategoryManagement
{
    public class CategoryDTO
    {
        
        public string? id_Category { get; set; }

     
        public string? categoryName { get; set; }
    }
}
