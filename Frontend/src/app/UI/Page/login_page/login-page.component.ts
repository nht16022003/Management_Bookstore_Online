import { Component } from '@angular/core';
import { AccountModel } from 'src/app/models/AccountModel';
import { AccountService } from 'src/app/services/Account_Service/Account.service';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/AuthService/auth.service';
import { NotificationService } from 'src/app/services/NotificationService/notification.service';

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
    private authservice:AuthService,
    private nofitication:NotificationService
  ){

  }

  login()
  {
   this.accountservice.getAccount(this.newAc).subscribe(response =>{
    console.log(response);
    //Đăng nhập thành công !
    this.authservice.login(response); //truyền response sang cho authservice

    this.nofitication.success('DANG NHAP THANH CONG', 'WELCOME');

    this.router.navigate(['/'])
    },
    
     
    error => {

      /**
       * 400 → Toast
          403 → Toast
          404 → Toast
          500 → Toast
       * 
       */
      //Login thất bại
      if(error.status == 401)
      {
        this.router.navigate(['/wrongaccount']);
      }
      
      
      
    } 
     
     
    )
    }
}