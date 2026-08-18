import { Component } from '@angular/core';
import { BookModel } from 'src/app/models/BookModel';
import { BookService } from 'src/app/services/Book_Service/book.service';
import { OnInit } from '@angular/core';


@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.css']
})
export class ListProductComponent implements OnInit {


  books:BookModel[]=[];


   /**Phân trang */
   currentPage:number = 1;

   pageSize: number = 8;

   keyword:string ='';

   totalItems: number = 0;

 
  constructor(
    private bookService: BookService
  ) 
  {
    
   
  }
  
  ngOnInit(): void {
      this.bookService.getBooks(this.currentPage, this.pageSize, this.keyword).subscribe(
      data => {
        this.books = data.books;
        console.log(this.books);
      },
      error => {
        alert("Không load được sách");
      }
     )
  }
 

  
}
