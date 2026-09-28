import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { BookModel } from 'src/app/models/BookModel';
import { CategoryModel } from 'src/app/models/CategoryModel';
import { CategoryService } from 'src/app/services/Category_Service/Catogery.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BookService } from 'src/app/services/Book_Service/book.service';
import { FileService } from 'src/app/services/FileService/file.service';
import { NotificationService } from 'src/app/services/NotificationService/notification.service';

@Component({
  selector: 'app-editproduct',
  templateUrl: './edit-product-page.component.html',
  styleUrls: ['./edit-product-page.component.css']
})
export class EditProductComponent implements OnInit {

  categories: CategoryModel[] = [];

  // Trạng thái upload ảnh
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;

  book: BookModel = {
    id_Book: 0,
    bookName: '',
    price: 0,
    description: '',
    imageURL: '',
    quantity: 0,
    id_Category: '',
    category_Name: ''
  };

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private bookService: BookService,
    private fileService: FileService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    // Lấy danh sách danh mục
    this.categoryService.getCategories().subscribe(
      data => { this.categories = data; },
      error => { console.log('Lỗi lấy danh mục:', error); }
    );

    // Lấy thông tin sách hiện tại theo ID từ route
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.bookService.getBookById(id).subscribe(
      data => { this.book = data; },
      error => { console.log(error); }
    );
  }

  // ==========================================
  // Người dùng chọn file ảnh mới
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

    // Kiểm tra dung lượng (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.notification.error('File không được vượt quá 10MB', 'File quá lớn');
      return;
    }

    this.selectedFile = file;
    this.uploadProgress = 0;

    // Tự động upload ngay khi chọn
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
        // Cập nhật progress
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        }

        // Upload hoàn thành — cập nhật URL ảnh vào form
        if (event.type === HttpEventType.Response && event.body) {
          this.book.imageURL = event.body.fileUrl;
          this.isUploading = false;
          this.uploadProgress = 100;
          this.notification.success('Ảnh đã được tải lên thành công!', 'Upload thành công');
        }
      },
      error => {
        this.isUploading = false;
        this.uploadProgress = 0;
        // ErrorInterceptor tự hiển thị Toast lỗi
      }
    );
  }

  // ==========================================
  // Xóa ảnh (dùng URL rỗng)
  // ==========================================
  removeImage(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.isUploading = false;
    this.book.imageURL = '';
  }

  // ==========================================
  // Submit form cập nhật sách
  // ==========================================
  updateBook(bookForm: NgForm): void {
    if (bookForm.invalid) return;

    this.bookService.editBook(this.book).subscribe(
      data => {
        this.notification.success('Cập nhật sách thành công!', 'Thành công');
        this.router.navigate(['/listproduct']);
      }
      // Không cần error handler — ErrorInterceptor đã xử lý Toast tự động
    );
  }

  cancel(): void {
    this.router.navigate(['/listproduct']);
  }
}
