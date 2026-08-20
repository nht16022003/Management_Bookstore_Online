import { Component } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FileService } from 'src/app/services/FileService/file.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload-page.component.html',
  styleUrls: ['./file-upload-page.component.css']
})
export class FileUploadComponent {

  // File người dùng chọn
  selectedFile: File | null = null;

  // Phần trăm upload
  uploadProgress = 0;

  // URL ảnh sau khi upload
  imageUrl = '';

  constructor(
    private fileService: FileService
  ) {}


  // ==========================================
  // 1. Người dùng chọn file
  // ==========================================
  onFileSelected(event: any): void {

    this.selectedFile = event.target.files[0];

    // Reset progress
    this.uploadProgress = 0;

    // Reset ảnh cũ
    this.imageUrl = '';

    console.log('File đã chọn:', this.selectedFile);
  }


  // ==========================================
  // 2. Upload file
  // ==========================================
  uploadFile(): void {

    // Chưa chọn file
    if (!this.selectedFile) {

      alert('Vui lòng chọn file');

      return;
    }

    // Gọi API Backend
    this.fileService
      .uploadFile(this.selectedFile)
      .subscribe(

        // ====================================
        // Nhận response từ Backend
        // ====================================
        event => {

          // ----------------------------------
          // Đang upload
          // ----------------------------------
          if (
            event.type === HttpEventType.UploadProgress
          ) {

            if (event.total) {

              this.uploadProgress =
                Math.round(
                  (event.loaded / event.total) * 100
                );

              console.log(
                'Upload:',
                this.uploadProgress + '%'
              );
            }
          }


          // ----------------------------------
          // Upload hoàn thành
          // ----------------------------------
          if (
            event.type === HttpEventType.Response
          ) {

            console.log(
              'Upload thành công:',
              event.body
            );

            // Kiểm tra body có tồn tại
            if (event.body) {

              this.imageUrl =
                event.body.fileUrl;
            }

            // Đảm bảo progress = 100%
            this.uploadProgress = 100;
          }

        },


        // ====================================
        // Upload thất bại
        // ====================================
        error => {

          console.error(
            'Upload thất bại:',
            error
          );

          alert('Upload file thất bại');

          this.uploadProgress = 0;
        }

      );
  }
}