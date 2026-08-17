import { Component } from '@angular/core';
import { AccountModel } from 'src/app/models/AccountModel';
import { AccountService } from 'src/app/services/Account_Service/Account.service';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/AuthService/auth.service';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
 
})
export class LoginPageComponent {
   newAc:AccountModel={
    userName:"",
    hashPassword:"",
    id:0,
    id_USER:0,
    status:true, 
    accountName:"",
    roleName:"",
    roleId: 0,
    userId:0
  };

  constructor(private accountservice: AccountService,
    private router:Router,
    private authservice:AuthService
  ){

  }

  login()
  {
   this.accountservice.getAccount(this.newAc).subscribe(response =>{
    console.log(response);
    //Đăng nhập thành công !
    this.authservice.login(response);
    this.router.navigate(['/'])
    },
    
     
    error => {
      //Login thất bại
      this.router.navigate(['/error']);
    } 
     
     
    )
    }
}