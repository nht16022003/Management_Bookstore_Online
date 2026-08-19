import { Component } from "@angular/core";
import { AccountModel } from "src/app/models/AccountModel";
import { AccountService } from "src/app/services/Account_Service/Account.service";
import { AuthService } from "src/app/services/AuthService/auth.service";
import { LoginPageComponent } from "../login_page/login-page.component";
import { Router } from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
 
})
export class Header {

    accountLoggined:AccountModel | null = null;

    constructor(private authservice:AuthService,
        private accountService:AccountService,
        private router: Router,
        public authservi: AuthService)
       
    {
        
    }

    

    isLoggined():boolean
    {
       
        return this.authservice.isLoggedIn(); //nếu login thành công trả về true
    }
    
    returnAccountInFo():AccountModel | null{
    
       if(this.isLoggined())
       {
         this.accountLoggined = this.authservice.getAccount();
         return this.accountLoggined;
        
        }
        return null;
    }

    accountReturned = this.returnAccountInFo();

    isLoggout():void{
        this.authservice.logout();
        localStorage.clear();
        this.router.navigate(['/login']);
    }

  

  };