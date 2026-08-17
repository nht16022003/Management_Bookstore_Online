import { Component } from '@angular/core';
import { BookService } from 'src/app/services/Book_Service/book.service';

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.css']
})
export class ListProductComponent {
 
  constructor(
    private bookService: BookService
  ) 
  {
   
  }
}
