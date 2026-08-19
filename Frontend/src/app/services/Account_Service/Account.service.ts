import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountModel } from '../../models/AccountModel';
import { RegisterModel } from 'src/app/models/RegisterModel';
@Injectable({
  providedIn: 'root'
})

export class AccountService{
    constructor(private http: HttpClient) { }
    getAccount(result: AccountModel) {

        return this.http.post<{
            account: AccountModel;
            token: string;
        }>(
            "https://localhost:44314/api/Account/login",
            result
        );

    }
    regisAccount(account: RegisterModel){
        return this.http.post<RegisterModel>("https://localhost:44314/api/Account/register", account);
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