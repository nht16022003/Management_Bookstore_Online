namespace ManagementBTOnline_API.Models.AuditManagement
{
    public class AuditLogModel
    {
        public int Id { get; set; }

        public int? UserId { get; set; }

        public string? UserName { get; set; }

        public string Action { get; set; } = "";

        public string? ControllerName { get; set; }

        public string? ActionName { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}