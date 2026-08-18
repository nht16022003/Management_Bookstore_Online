import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookModel } from 'src/app/models/BookModel';


@Injectable({
  providedIn: 'root'
})

export class BookService{
    constructor(private http: HttpClient) { }

    
    
    getBooks(page:number, size:number, keyword:string){
        return this.http.get<{
            books:BookModel[],
            totalItems:number,
            page:number,
            size:number
            //khai báo trùng name với return Ok(..) bên controller để tránh
            //lỗi undefined

        }>
        (`https://localhost:44314/api/Book/Cau1?page=${page}&size=${size}&keyword=${keyword}`);
    }

    
    }

    
    
    /**
     * upDateStudent(student: student)
    {
        return this.http.put<AccountModel>
        (`https://localhost:44375/api/student/id?id=${student.id}`, student);
    }
    deleteStudent(student: student)
    {
        return this.http.delete<AccountModel>
        (`https://localhost:44375/api/student/${student.id}`);
    }
    addStudent(student: student)
    {
        return this.http.post<AccountModel>
        (`https://localhost:44375/api/student`, student);
    }
     */
