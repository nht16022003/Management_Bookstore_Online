import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { AddBookModel } from 'src/app/models/AddBookModel';
import { BookService } from 'src/app/services/Book_Service/book.service';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/services/Category_Service/Catogery.service';
import { CategoryModel } from 'src/app/models/CategoryModel';
import { FileService } from 'src/app/services/FileService/file.service';
import { NotificationService } from 'src/app/services/NotificationService/notification.service';

@Component({
  selector: 'app-addproduct',
  templateUrl: './add-product-page.component.html',
  styleUrls: ['./add-product-page.component.css']
})
export class AddProductComponent implements OnInit {

  categories: CategoryModel[] = [];

  // Trạng thái upload ảnh
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;

  book: AddBookModel = {
    bookName: '',
    price: 0,
    description: '',
    imageURL: '',
    quantity: 0,
    id_Category: ''
  };

  constructor(
    private bookService: BookService,
    private router: Router,
    private categoryService: CategoryService,
    private fileService: FileService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  // ==========================================
  // Người dùng chọn file ảnh
  // ==========================================
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (!file) return;

    // Kiểm tra định dạng phía client
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.notification.error('Chỉ chấp nhận file .jpg, .jpeg, .png, .webp', 'Định dạng không hợp lệ');
      return;
    }

    // Kiểm tra dung lượng phía client (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.notification.error('File không được vượt quá 10MB', 'File quá lớn');
      return;
    }

    this.selectedFile = file;
    this.uploadProgress = 0;
    this.book.imageURL = ''; // Reset URL cũ khi chọn file mới

    // Tự động upload ngay khi chọn file
    this.uploadImage();
  }

  // ==========================================
  // Upload ảnh lên server
  // ==========================================
  uploadImage(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.fileService.uploadFile(this.selectedFile).subscribe(
      event => {
        // Cập nhật progress bar
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        }

        // Upload hoàn thành
        if (event.type === HttpEventType.Response && event.body) {
          this.book.imageURL = event.body.fileUrl; // Tự động điền URL vào form
          this.isUploading = false;
          this.uploadProgress = 100;
          this.notification.success('Ảnh đã được tải lên thành công!', 'Upload thành công');
        }
      },
      error => {
        this.isUploading = false;
        this.uploadProgress = 0;
        // ErrorInterceptor sẽ hiển thị Toast lỗi tự động
      }
    );
  }

  // ==========================================
  // Xóa ảnh đã chọn
  // ==========================================
  removeImage(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.isUploading = false;
    this.book.imageURL = '';
  }

  // ==========================================
  // Submit form thêm sách
  // ==========================================
  addBook(bookForm: NgForm): void {
    if (bookForm.invalid) return;

    this.bookService.addBook(this.book).subscribe(
      response => {
        this.notification.success('Thêm sách thành công!', 'Thành công');
        this.router.navigate(['/listproduct']);
      }
      // Không cần error handler — ErrorInterceptor đã xử lý Toast tự động
    );
  }

  cancel(): void {
    this.router.navigate(['/listproduct']);
  }
}
