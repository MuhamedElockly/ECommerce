import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from '../../../services/category.service';
import { ICategory } from '../../../models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: false,
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit, OnDestroy {
  categories: ICategory[] = [];
  filteredCategories: ICategory[] = [];
  searchTerm = '';
  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories = categories;
        this.applyFilters();
      });
  }

  applyFilters(): void {
    this.filteredCategories = this.categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  editCategory(category: ICategory): void {
    this.router.navigate(['/admin/edit-category', category.id]);
  }

  deleteCategory(category: ICategory): void {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            this.loadCategories();
          } else {
            alert('Failed to delete category');
          }
        });
    }
  }


  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
