import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountModel } from '../../models/AccountModel';
@Injectable({
  providedIn: 'root'
})

export class AccountService{
    constructor(private http: HttpClient) { }
    getAccount(newAc: AccountModel){
        return this.http.post<AccountModel>
        ("https://localhost:44314/api/Account/login", newAc);
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