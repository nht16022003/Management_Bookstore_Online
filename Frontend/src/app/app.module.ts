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
@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomePageComponent,
    Header,
    ListGroupComponent,
    MainLayoutComponent,
    ListGroupComponent,
    WrongAccountLoginComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
