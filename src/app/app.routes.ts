import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/components/admin-dashboard/admin-dashboard.component';
import { AddProductComponent } from './admin/components/add-product/add-product.component';
import { ProductListComponent } from './admin/components/product-list/product-list.component';
import { EditProductComponent } from './admin/components/edit-product/edit-product.component';
import { CategoryListComponent } from './admin/components/category-list/category-list.component';
import { AddCategoryComponent } from './admin/components/add-category/add-category.component';
import { EditCategoryComponent } from './admin/components/edit-category/edit-category.component';
import { UserLayoutComponent } from './user/components/user-layout/user-layout.component';
import { ProductCatalogComponent } from './user/components/product-catalog/product-catalog.component';
import { ShoppingCartComponent } from './user/components/shopping-cart/shopping-cart.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthGuard, AdminGuard, CustomerGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  {

    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },


  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductListComponent },
      { path: 'add-product', component: AddProductComponent },
      { path: 'edit-product/:id', component: EditProductComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'add-category', component: AddCategoryComponent },
      { path: 'edit-category/:id', component: EditCategoryComponent }
    ]
  },

  {
    path: 'user',
    component: UserLayoutComponent,
    canActivate: [CustomerGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductCatalogComponent },
      { path: 'cart', component: ShoppingCartComponent }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: '/login'
  }
];
