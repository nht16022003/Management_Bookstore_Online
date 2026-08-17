import { Component } from "@angular/core";
import { AccountModel } from "src/app/models/AccountModel";
import { AccountService } from "src/app/services/Account_Service/Account.service";
import { AuthService } from "src/app/services/AuthService/auth.service";
import { LoginPageComponent } from "../login_page/login-page.component";
import { Router } from "@angular/router";

@Component({
  selector: 'app-errors',
  templateUrl: './errors_page.component.html',
  styleUrls: ['./errors_page.component.css'],
 
})
export class ErrorComponent {

  

  };