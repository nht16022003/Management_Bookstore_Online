namespace ManagementBTOnline_API.Models.DashboardManagement
{
    public class UserByRoleDTO
    {
        /// <summary>Tên vai trò: ADMIN, STAFF, CUSTOMER</summary>
        public string RoleName { get; set; } = "";

        /// <summary>Số lượng người dùng có vai trò đó</summary>
        public int Count { get; set; }
    }
}
