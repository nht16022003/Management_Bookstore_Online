import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookModel } from 'src/app/models/BookModel';
import { AddBookModel } from 'src/app/models/AddBookModel';

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

     addBook(book:AddBookModel){
        return this.http.post<AddBookModel>(
            "https://localhost:44314/api/Book/addBooks", book
        );

   
    }

      getBookById(id: number){
        return this.http.get<BookModel>( `https://localhost:44314/api/Book/${id}`);
      }
      
      editBook(book:BookModel){
        return this.http.put<BookModel>
        (`https://localhost:44314/api/Book/editBook?id=${book.id_Book}`, book);
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
