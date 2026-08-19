namespace ManagementBTOnline_API.Models.BookManagement
{
    public class BookDTO
    {

        public int? id_Book { get; set; }
        public string bookName { get; set; }

        public decimal? price { get; set; }

        public string? description { get; set; }

        public string? imageURL { get; set; }

        public int? quantity { get; set; }

        public string? id_Category { get; set; }
        
        public string? category_Name { get; set; }

    }
}
