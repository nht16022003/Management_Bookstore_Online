import { Component, OnInit } from "@angular/core";

import { CategoryModel } from "src/app/models/CategoryModel";
import { AuthService } from "src/app/services/AuthService/auth.service";
import { CategoryService } from "src/app/services/Category_Service/Catogery.service";

@Component({
  selector: 'app-listgroup',
  templateUrl: './list_group.component.html',
  styleUrls: ['./list_group.component.css'],
 
})
export class ListGroupComponent implements OnInit{

  catogeries: CategoryModel[] = [];
  constructor( private categoryService: CategoryService,
    private authservice:AuthService
  ){}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(data =>
    {
      this.catogeries = data;
      console.log(this.catogeries);
    },
    error => {
      alert("Không lấy thành công thông tin danh mục!");
    }
    )
  }

  checkRole():boolean{
    if(this.authservice.getAccount()?.roleName == "ADMIN")
    {
      return true;
    }
    return false;
  }

  };