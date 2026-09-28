import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './UI/Page/login_page/login-page.component';
import { HomePageComponent } from './UI/Page/home_page/home-page.component';
import { MainLayoutComponent } from './UI/Page/main-layout/main-layout.component';
import { ListProductComponent } from './UI/Page/product/list-product/list-product.component';
import { ServerErrorComponent } from './UI/Page/errors_page/server-error-page.component';
import { WrongAccountLoginComponent } from './UI/Page/errors_page/wrong_accountlogin_page/wrong_accountlogin_page.component';
import { RegisterComponent } from './UI/Page/register_page/register-page.component';
import { RegisterSucessComponent } from './UI/Page/register_page/register-success_page/register-success.component';
import { AuthGuard } from './guards/auth.guard';
import { AddProductComponent } from './UI/Page/product/add-product/add-product-page.component';
import { EditProductComponent } from './UI/Page/product/edit-product/edit-product-page.component';
import { AuditLogComponent } from './UI/Page/audit-log/audit-log-page.component';
import { FileUploadComponent } from './UI/Page/file-upload_page/file-upload-page.component';
import { DashboardComponent } from './UI/Page/dashboard/dashboard-page.component';

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
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'listproduct',
        component: ListProductComponent,
        canActivate: [AuthGuard]
      },
      {
        path:'server-error',
        component: ServerErrorComponent
      },
      {
        path:'wrongaccount',
        component: WrongAccountLoginComponent
      },
      {
        path:'register',
        component:RegisterComponent
      },
      {
        path:'register-sucess',
        component:RegisterSucessComponent
      },
      {
        path:'addBook',
        component:AddProductComponent
      },
      {
        path:'editBook/:id',
        component:EditProductComponent
      },
      {
        path:'audit-log',
        component:AuditLogComponent
      },
      {
        path:'admin/upload',
        component:FileUploadComponent
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