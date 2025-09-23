import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from '../../../services/category.service';
import { ICategory } from '../../../models/category.model';

@Component({
  selector: 'app-edit-category',
  standalone: false,
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.css']
})
export class EditCategoryComponent implements OnInit, OnDestroy {
  category: ICategory | null = null;
  isSubmitting = false;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (categoryId) {
      this.loadCategory(+categoryId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategory(id: number): void {
    this.categoryService.getCategoryById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(category => {
        if (category) {
          this.category = category;
        } else {
          this.router.navigate(['/admin/categories']);
        }
        this.isLoading = false;
      });
  }

  onSubmit(form: any): void {
    if (form.valid && !this.isSubmitting && this.category) {
      this.isSubmitting = true;
      const categoryData: Partial<ICategory> = {
        name: form.value.name,
        description: form.value.description
      };
      
      this.categoryService.updateCategory(this.category.id!, categoryData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedCategory) => {
            if (updatedCategory) {
              console.log('Category updated successfully:', updatedCategory);
              this.router.navigate(['/admin/categories']);
            } else {
              alert('Failed to update category');
              this.isSubmitting = false;
            }
          },
          error: (error) => {
            console.error('Error updating category:', error);
            alert('Error updating category');
            this.isSubmitting = false;
          }
        });
    }
  }
}
