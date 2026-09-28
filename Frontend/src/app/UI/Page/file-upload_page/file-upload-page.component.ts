import { Component } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { FileService } from 'src/app/services/FileService/file.service';
import { NotificationService } from 'src/app/services/NotificationService/notification.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload-page.component.html',
  styleUrls: ['./file-upload-page.component.css']
})
export class FileUploadComponent {

  selectedFile: File | null = null;
  uploadProgress = 0;
  imageUrl = '';
  isUploading = false;
  hasError = false; //  khai báo hasError

  constructor(
    private fileService: FileService,
    private notification: NotificationService  // Service thông báo đã inject
  ) {}

  
  // 1. Người dùng chọn file
 
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
    this.imageUrl = '';
  }

 
  // 2. Upload file
 
  uploadFile(): void {

    if (!this.selectedFile) {
      this.notification.warning('Vui lòng chọn file trước khi upload', 'Chưa chọn file');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

     this.fileService.uploadFile(this.selectedFile).subscribe({
      next: (event) => {
        // Đang upload — cập nhật progress
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        }
        // Upload hoàn thành
        if (event.type === HttpEventType.Response && event.body) {
          this.imageUrl = event.body.fileUrl;
          // Lấy Token và Account được Backend trả về:
          console.log('Token hiện tại:', event.body.token);
          console.log('Account hiện tại:', event.body.taikhoan);
          console.log('Xin chào user:', event.body.taikhoan?.username);
          this.isUploading = false;
          this.uploadProgress = 100;
          this.notification.success('File đã được tải lên thành công!', 'Upload thành công');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isUploading = false;
        this.hasError = true; // Chuyển trạng thái lỗi
        if (err.status === 0 || !navigator.onLine) {
          this.notification.error('Mất kết nối Internet! Vui lòng kiểm tra lại mạng và thử lại.', 'Mất kết nối');
        } else {
          const message = err.error?.message || err.message || 'Có lỗi xảy ra khi tải lên file.';
          this.notification.error(message, 'Upload thất bại');
        }
      }
    });

  }
}