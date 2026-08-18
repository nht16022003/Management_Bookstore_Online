import { Component } from '@angular/core';
import { AccountModel } from 'src/app/models/AccountModel';
import { RegisterModel } from 'src/app/models/RegisterModel';
import { AccountService } from 'src/app/services/Account_Service/Account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterComponent {
    register: RegisterModel = {

       

        id_Role:2,


        user_Name:"string",//tên người dùng


        user_Age:0,


        user_Address:"string",


        user_Phone:"string",


        user_Email:"string",

     

        userName:"string", //tên account

        hashPassword:"string",

    
        status:true,

    }

   

  constructor(private accountService:AccountService,
    private router:Router
  ) 
  {
    //localStorage.clear();
    
  }

   regis(){
        this.accountService.regisAccount(this.register).subscribe(data =>
        {
            console.log(data);
            this.router.navigate(['/register-sucess'])
        }
        )
    }
}
