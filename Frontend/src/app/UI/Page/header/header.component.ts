import { Component } from "@angular/core";
import { AuthService } from "src/app/services/AuthService/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
 
})
export class Header {

    constructor(private authservice:AuthService){}

    checkLogin:boolean = false; 

    isLoggined()
    {
        this.authservice.isLoggedIn();
    }

  };