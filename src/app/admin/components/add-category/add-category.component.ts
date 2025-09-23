import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { ICategory } from '../../../models/category.model';

@Component({
  selector: 'app-add-category',
  standalone: false,
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent {
  isSubmitting = false;

  constructor(
    private categoryService: CategoryService,
    public router: Router
  ) {}

  onSubmit(form: any): void {
    if (form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const categoryData: ICategory = {
        name: form.value.name,
        description: form.value.description
      };
      
      this.categoryService.createCategory(categoryData).subscribe({
        next: (category) => {
          console.log('Category created successfully:', category);
          this.router.navigate(['/admin/categories']);
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.isSubmitting = false;
        }
      });
    }
  }
}
