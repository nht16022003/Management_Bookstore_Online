namespace ManagementBTOnline_API.Models.DashboardManagement
{
    public class AuditLogByDayDTO
    {
        /// <summary>Ngày định dạng "dd/MM" — dùng làm nhãn trục X biểu đồ cột</summary>
        public string Date { get; set; } = "";

        /// <summary>Số lượng thao tác trong ngày đó</summary>
        public int Count { get; set; }
    }
}
