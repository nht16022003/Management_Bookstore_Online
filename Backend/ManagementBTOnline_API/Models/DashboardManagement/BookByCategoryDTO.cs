namespace ManagementBTOnline_API.Models.DashboardManagement
{
    public class BookByCategoryDTO
    {
        /// <summary>Tên danh mục — dùng làm nhãn biểu đồ tròn</summary>
        public string CategoryName { get; set; } = "";

        /// <summary>Số sách trong danh mục này</summary>
        public int Count { get; set; }
    }
}
