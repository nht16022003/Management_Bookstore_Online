import { Component } from '@angular/core';
import { BookModel } from 'src/app/models/BookModel';
import { BookService } from 'src/app/services/Book_Service/book.service';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.css']
})
export class ListProductComponent implements OnInit {


  books:BookModel[]=[];


   /**Phân trang */
   page:number = 1;

   size: number = 8;

   keyword:string ='';

   totalItems: number = 0;

 
  constructor(
    private bookService: BookService,
    private router:Router
  ) 
  {
    
   
  }
  
  ngOnInit(): void {
       this.bookService.getBooks(this.page, this.size, this.keyword).subscribe(
      data => {
        this.books = data.books;
        this.totalItems = data.totalItems;
        
        console.log(this.books);
      },
      error => {
        alert("Không load được sách");
      }
     )
  }
 
/**Phân trang */

   //Tổng trang
   get totalPage():number{
    return Math.ceil(this.totalItems/this.size);
    /**
     * 
     * this.book.length: số lượng sách
     * this.pageSize: số lượng hiển thị trên mỗi trang
     * 
     * Math.ceil(20/8)=3 trang, có 3 trang để hiển thị sao cho mỗi trang tối đa 8 item 
     */
   }

   /**Chuyển trang */
   changePage(page: number): void {

    if (page < 1 || page > this.totalPage) {
        return;
    }

    this.page = page;
    this.ngOnInit();
}

  addBook(): void {
    this.router.navigate(['/addBook']);
}

editBook(book: BookModel): void {

     console.log("ITEM:", book);
    console.log("ID:", book.id_Book);
    this.router.navigate(['/editBook', book.id_Book]);
}

deleteBook(book: BookModel): void {
    console.log('Xóa sách:', book);
}

searchBook()
{}
  
}
