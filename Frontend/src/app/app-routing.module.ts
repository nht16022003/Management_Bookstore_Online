import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './UI/Page/login_page/login-page.component';
import { HomePageComponent } from './UI/Page/home_page/home-page.component';
import { MainLayoutComponent } from './UI/Page/main-layout/main-layout.component';

const routes: Routes = [

  // localhost:4200/ → MainLayout → HomePage
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent
      }
    ]
  },

  // localhost:4200/login → LoginPage
  {
    path: 'login',
    component: LoginPageComponent
  }

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