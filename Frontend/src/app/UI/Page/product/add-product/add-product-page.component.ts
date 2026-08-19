import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AddBookModel } from 'src/app/models/AddBookModel';
import { BookService } from 'src/app/services/Book_Service/book.service';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/services/Category_Service/Catogery.service';
import { CategoryModel } from 'src/app/models/CategoryModel';


@Component({
  selector: 'app-addproduct',
  templateUrl: './add-product-page.component.html',
  styleUrls: ['./add-product-page.component.css']
})
export class AddProductComponent implements OnInit{
    categories:CategoryModel[]=[];
  
  constructor(private bookService:BookService,
    private router:Router,
    private categoryService:CategoryService
  ) 
  {
    //localStorage.clear();
  }
  ngOnInit(): void {
      this.categoryService.getCategories().subscribe(data => {
        this.categories = data;
      })
  }

 book: AddBookModel = {
    bookName: '',
    price: 0,
    description: '',
    imageURL: '',
    quantity: 0,
    id_Category: ''
 };

 addBook(bookForm: NgForm): void {

  if (bookForm.invalid) {
    return;
  }

   this.bookService.addBook(this.book).subscribe(
    response => {
      alert('Thêm sách thành công');
      this.router.navigate(['/listproduct']);
    },
    error => {
      console.log(error);
      alert('Thêm sách thất bại');
      this.router.navigate(['/listproduct']);
    }
  );

  

  
}
cancel()
  {
    this.router.navigate(['/addBook']);
  }

  
}
