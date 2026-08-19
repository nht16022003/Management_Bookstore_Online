import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AddBookModel } from 'src/app/models/AddBookModel';
import { OnInit } from '@angular/core';
import { CategoryModel } from 'src/app/models/CategoryModel';
import { CategoryService } from 'src/app/services/Category_Service/Catogery.service';
import { BookModel } from 'src/app/models/BookModel';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BookService } from 'src/app/services/Book_Service/book.service';

@Component({
  selector: 'app-editproduct',
  templateUrl: './edit-product-page.component.html',
  styleUrls: ['./edit-product-page.component.css']
})
export class EditProductComponent implements OnInit {


   categories:CategoryModel[]=[];
   b!: BookModel;

   book: BookModel = {
      id_Book:0,
      bookName: '',
      price: 0,
      description: '',
      imageURL: '',
      quantity: 0,
      id_Category: '',
      category_Name:''
   };



  constructor(private categoryService:CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private bookService: BookService

  ) 
  {
    //localStorage.clear();
    
  }

    ngOnInit(): void {

        // Lấy danh sách danh mục
    this.categoryService.getCategories().subscribe(
        data => {
            this.categories = data;

            console.log('Categories:', this.categories);
        },
        error => {
            console.log('Lỗi lấy danh mục:', error);
        }
    );


      const id = Number(
        this.route.snapshot.paramMap.get('id')
      );

      this.bookService.getBookById(id).subscribe(
        data => {
            this.book = data;
            console.log(this.book);
        },
        error =>{
            console.log(error);
        }
      )
  };

  

  updateBook(bookForm: NgForm): void {

    if (bookForm.invalid) {
        return;
    }

    console.log('Dữ liệu chuẩn bị gửi:', this.book);

    this.bookService.editBook(this.book).subscribe(
        data => {
            console.log('Backend trả về:', data);

            alert('Cập nhật sách thành công');

            this.router.navigate(['/listproduct']);
        },
        error => {
            console.log('Lỗi:', error);

            alert('Cập nhật sách thất bại');
        }
    );
    }
  cancel(){};
}
