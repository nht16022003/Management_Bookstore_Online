import { Component } from '@angular/core';
import { AccountModel } from 'src/app/models/AccountModel';
import { RegisterModel } from 'src/app/models/RegisterModel';

@Component({
  selector: 'app-register-sucess',
  templateUrl: './register-success.component.html',
  styleUrls: ['./register-success.component.css']
})
export class RegisterSucessComponent {
   
  constructor() 
  {
    //localStorage.clear();
  }
}
