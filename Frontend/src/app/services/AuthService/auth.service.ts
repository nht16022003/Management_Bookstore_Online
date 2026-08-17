import { Injectable } from "@angular/core";
import { AccountModel } from "src/app/models/AccountModel";
import { AccountService } from "../Account_Service/Account.service";

@Injectable({
    providedIn:'root'
})
export class AuthService{
    private loggedIn = false; 
    private account: AccountModel | null = null;

    login(account: AccountModel): void
    {
        //api trả response = account: AccountModel
        this.account = account; //account khai báo sẽ là account được reponse dìa
    }

    logout():void
    {
        this.account = null;
    }

    isLoggedIn():boolean{
        
        return this.account != null; //trả về true nếu account != null
    }

    getAccount(): AccountModel | null{
        return this.account;
    }
}