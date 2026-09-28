using Microsoft.AspNetCore.SignalR;

namespace ManagementBTOnline_API.Hubs
{
    public class DashboardHub : Hub
    {
        //hub đóng vai trò là kênh phát sóng 
        //Khi client kết nối hoặc ngắt kết nối có thể ghi log tại đây nếu cần
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}