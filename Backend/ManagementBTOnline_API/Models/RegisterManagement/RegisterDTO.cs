namespace ManagementBTOnline_API.Models.RegisterManagement
{
    public class RegisterDTO
    {
        public int id_User { get; set; } //mã người dùng


        public int id_Role { get; set; } //mã role


        public string user_Name { get; set; } //tên người dùng


        public int user_Age { get; set; }


        public string user_Address { get; set; }


        public string user_Phone { get; set; }


        public string user_Email { get; set; }

        public string userName { get; set; } //tên account

        public string hashPassword { get; set; }

        public bool status { get; set; }

      
    }
}
