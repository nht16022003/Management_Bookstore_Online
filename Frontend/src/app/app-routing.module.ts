import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './UI/Page/login_page/login-page.component';
import { HomePageComponent } from './UI/Page/home_page/home-page.component';
import { MainLayoutComponent } from './UI/Page/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        component: HomePageComponent
      }
    ]

  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
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