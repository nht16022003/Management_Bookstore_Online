import { Component, OnInit } from '@angular/core';
import { BookModel } from 'src/app/models/BookModel';
import { BookService } from 'src/app/services/Book_Service/book.service';
import { AuthService } from 'src/app/services/AuthService/auth.service';
import { NotificationService } from 'src/app/services/NotificationService/notification.service';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
 
})
export class HomePageComponent implements OnInit{
   books: BookModel[] = [];

   /**Phân trang */
   page:number = 1; //trang hiện tại

   size: number = 8;

   keyword:string ='';

   totalItems: number = 0;

   constructor( private bookService: BookService,
    private authservice: AuthService,
    private notification: NotificationService
   ){}

   ngOnInit(): void {
     
      
       this.bookService.getBooks(this.page, this.size, this.keyword).subscribe(
      data => {
        this.books = data.books;
        this.totalItems = data.totalItems;
      }
      // Không cần error handler — ErrorInterceptor tự hiện Toast lỗi
     )
      

     
   }
   

   //Phân loại Role đê hiển thị button edit 
   checkRole():boolean{
    if(this.authservice.getAccount()?.roleName=="ADMIN")
    {
      return true;
    }
    return false;
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
}