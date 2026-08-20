namespace ManagementBTOnline_API.Models.ErrorResponse.cs
{
    public class ErrorResponseModel
    {
        public int StatusCode { get; set; }

        public string Message { get; set; }

        public string Error { get; set; }

        public DateTime Timestamp { get; set; }
    }
}
