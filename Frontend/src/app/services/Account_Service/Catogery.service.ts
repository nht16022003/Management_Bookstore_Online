import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoryModel } from '../../models/CategoryModel';
@Injectable({
  providedIn: 'root'
})

export class CategoryService{
    constructor(private http: HttpClient) { }
    
    getCategories(){
        return this.http.get<CategoryModel[]>
        ("https://localhost:44314/api/Category");
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
}