import { Injectable } from "@angular/core";
import { AccountModel } from "src/app/models/AccountModel";
import { AccountService } from "../Account_Service/Account.service";

@Injectable({
    providedIn:'root'
})
export class AuthService{
    private loggedIn = false; 
    private account: AccountModel | null = null; //property của AuthService

    login(account: AccountModel): void
    {
        //api trả response = account: AccountModel
        this.account = account; //account khai báo sẽ là account được reponse dìa, lưu account vào AuthSerice 

        localStorage.setItem(
            'account',
            JSON.stringify(account)
        );
    }

    logout():void
    {
        this.account = null;
    }

    isLoggedIn():boolean{
        
        return this.getAccount() != null; //trả về true nếu account != null
    }

    getAccount(): AccountModel | null{
        //Trường hợp ban đầu đã login lần đầu
       if(this.account != null)
       {
        return this.account;
       }

       //Trường hợp reload lại trang thì xem như login chưa có gì, cần lấy account trên 
       //localstorage để tiếp tục trạng thái login

       const data = localStorage.getItem('account');

       if(data != null)
       {
        this.account = JSON.parse(data);
       }
       return this.account;
    }
}