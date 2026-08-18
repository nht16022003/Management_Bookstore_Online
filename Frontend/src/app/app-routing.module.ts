import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './UI/Page/login_page/login-page.component';
import { HomePageComponent } from './UI/Page/home_page/home-page.component';
import { MainLayoutComponent } from './UI/Page/main-layout/main-layout.component';
import { ListProductComponent } from './UI/Page/product/list-product/list-product.component';
import { ServerErrorComponent } from './UI/Page/errors_page/server-error-page.component';
import { WrongAccountLoginComponent } from './UI/Page/errors_page/wrong_accountlogin_page/wrong_accountlogin_page.component';

const routes: Routes = [

  // localhost:4200/ → MainLayout → HomePage
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent
      },
      {
        path: 'listproduct',
        component: ListProductComponent
      },
      {
        path:'server-error',
        component: ServerErrorComponent
      },
      {
        path:'wrongaccount',
        component: WrongAccountLoginComponent
      }
    ]
  },

  // localhost:4200/login → LoginPage
  {
    path: 'login',
    component: LoginPageComponent
  }, 
  
  

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }