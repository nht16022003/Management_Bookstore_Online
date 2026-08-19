import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './UI/Page/login_page/login-page.component';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { HomePageComponent } from './UI/Page/home_page/home-page.component';
import { Header } from './UI/Page/header/header.component';
import { ListGroupComponent } from './UI/Page/list_group/list_group.component';
import { MainLayoutComponent } from './UI/Page/main-layout/main-layout.component';
import { WrongAccountLoginComponent } from './UI/Page/errors_page/wrong_accountlogin_page/wrong_accountlogin_page.component';
import { RegisterComponent } from './UI/Page/register_page/register-page.component';
import { RegisterSucessComponent } from './UI/Page/register_page/register-success_page/register-success.component';
import { CommonModule } from '@angular/common';
import { ListProductComponent } from './UI/Page/product/list-product/list-product.component';
import { AddProductComponent } from './UI/Page/product/add-product/add-product-page.component';
import { EditProductComponent } from './UI/Page/product/edit-product/edit-product-page.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuditLogComponent } from './UI/Page/audit-log/audit-log-page.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomePageComponent,
    Header,
    ListGroupComponent,
    MainLayoutComponent,
    ListGroupComponent,
    WrongAccountLoginComponent,
    RegisterComponent,
    RegisterSucessComponent,
    ListProductComponent,
    AddProductComponent,
    EditProductComponent,
    AuditLogComponent
  
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule
    
  ],
  providers: [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
