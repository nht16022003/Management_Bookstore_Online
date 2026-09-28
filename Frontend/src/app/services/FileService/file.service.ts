import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface taiKhoanHienHanh{
  userId: string;
  username: string;
  role: string;
}
export interface UploadResponse{
    message:string;
    fileName:string;
    fileUrl:string;
    token?:string; //Nhận token từ backend
    taikhoan?: taiKhoanHienHanh;
}

@Injectable({
  providedIn: 'root'
})

export class FileService {
  

  private apiUrl = 'http://localhost:5144/api/File';

  constructor(private http: HttpClient) { }

  uploadFile(file: File) {

    const formData = new FormData(); /**Đối tượng
     chuẩn của JavaScript dùng để đóng gói dữ liệu nhị phân (binary data/file) theo định dạng multipart/form-data nhằm truyền qua giao thức HTTP. */

    formData.append('file', file); //Khớp với tham số bên IFormFile file bên C# backend

    return this.http.post<UploadResponse>(
        `${this.apiUrl}/upload`,
        formData,
        {
        reportProgress: true, // Kích hoạt cơ chế của trình duyệt (xhr.upload.onprogress), liên tục đo lường số bytes đã truyền đi qua card mạng.
        observe: 'events' //Mặc định Angular chỉ trả về kết quả cuối cùng. Khi bật cờ này, Angular sẽ trả về toàn bộ dòng sự kiện trong suốt chuyến đi của gói tin:
        }
        /**
         * {
         * Angular sẽ trả về: 
            "message": "Upload thành công",
            "fileName": "abc.jpg",
            "fileUrl": "https://localhost:7185/uploads/images/abc.jpg"
}
         * 
         * 
         */
    );
}

}