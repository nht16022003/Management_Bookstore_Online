//Xử lý lấy chung vai trò cho các combonent khác nếu cần
import { Component } from '@angular/core';
import { AccountModel } from 'src/app/models/AccountModel';
import { AccountService } from 'src/app/services/Account_Service/Account.service';
import { AuthService } from 'src/app/services/AuthService/auth.service';


@Component({
 //
})
export class RoleComponent {
    constructor(private accountservice: AccountService,
    private authservice:AuthService
){}

    roleAccount: string | null = null;

    getRole():string | null{
        
       this.roleAccount = this.authservice.getAccount()?.roleName.trim() ?? null;

       return this.roleAccount;
    }

};

 
