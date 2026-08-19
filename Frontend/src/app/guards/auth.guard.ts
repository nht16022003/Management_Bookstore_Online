import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/AuthService/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate{
    constructor(
        private authService:AuthService, 
        private router:Router
    ){}

    canActivate():boolean{ //chặn customer chưa đăng nhập và customer đi vào dssp
        const account = this.authService.getAccount();

        if(account == null)
        {
            this.router.navigate(['/login']);
            return false; 
        }

        if(account.roleName != 'ADMIN')
        {
            this.router.navigate(['/']);
            return false;
        }

       

        return true;
    }
}