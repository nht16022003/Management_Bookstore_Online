import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


export interface UploadResponse{
    message:string;
    fileName:string;
    fileUrl:string
}

@Injectable({
  providedIn: 'root'
})

export class FileService {
  

  private apiUrl = 'https://localhost:44314/api/File';

  constructor(private http: HttpClient) { }

  uploadFile(file: File) {

    const formData = new FormData(); //FormData là cách Angular
    //đóng gói file để gửi lên Backend

    formData.append('file', file);

    return this.http.post<UploadResponse>(
        `${this.apiUrl}/upload`,
        formData,
        {
        reportProgress: true,
        observe: 'events'
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