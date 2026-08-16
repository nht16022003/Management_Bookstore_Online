import { Component, OnInit } from '@angular/core';
import { AccountModel } from 'src/app/models/AccountModel';
import { AccountService } from 'src/app/services/Account_Service/Account.service';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { Route } from '@angular/router';
import { BookModel } from 'src/app/models/BookModel';
import { BookService } from 'src/app/services/Book_Service/book.service';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
 
})
export class HomePageComponent implements OnInit{
   books: BookModel[] = [];
   constructor( private bookService: BookService){}

   ngOnInit(): void {
     this.bookService.getBooks().subscribe(
      data => {
        this.books = data;
        console.log(this.books);
      },
      error => {
        alert("Không load được sách");
      }
     )
   }
}