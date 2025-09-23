import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ICategory } from '../models/category.model';
import { ApiResponse, CreateCategoryDTO, UpdateCategoryDTO, CategoryResponseDTO } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: ICategory[] = [];
  private categoriesSubject = new BehaviorSubject<ICategory[]>(this.categories);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) { }


  // Get all categories
  getCategories(): Observable<ICategory[]> {
    return this.http.get<ApiResponse<CategoryResponseDTO[]>>(`${environment.apiUrl}/Category`)
      .pipe(
        map(response => {
          console.log('API Response:', response);
          
          // Check if response has the expected structure
          if (response && response.data) {
            const categories = response.data.map(cat => this.mapToICategory(cat));
            this.categories = categories;
            this.categoriesSubject.next([...this.categories]);
            return categories;
          } else if (response && Array.isArray(response)) {
            // Handle case where API returns array directly
            const categories = response.map(cat => this.mapToICategory(cat));
            this.categories = categories;
            this.categoriesSubject.next([...this.categories]);
            return categories;
          } else {
            console.error('Unexpected API response structure:', response);
            throw new Error('Unexpected API response structure');
          }
        }),
        catchError(error => {
          console.error('Error fetching categories:', error);
          return throwError(() => error);
        })
      );
  }

  // Get active categories only (same as all categories for now)
  getActiveCategories(): Observable<ICategory[]> {
    return this.getCategories();
  }

  // Get category by ID
  getCategoryById(id: number): Observable<ICategory | undefined> {
    return this.http.get<ApiResponse<CategoryResponseDTO>>(`${environment.apiUrl}/Category/${id}`)
      .pipe(
        map(response => {
          console.log('Get Category by ID Response:', response);
          
          if (response && response.data) {
            return this.mapToICategory(response.data);
          } else {
            throw new Error('Category not found');
          }
        }),
        catchError(error => {
          console.error('Error fetching category:', error);
          return of(undefined);
        })
      );
  }

  // Create new category
  createCategory(categoryData: ICategory): Observable<ICategory> {
    const createDTO: CreateCategoryDTO = {
      name: categoryData.name,
      description: categoryData.description
    };

    return this.http.post<ApiResponse<CategoryResponseDTO>>(`${environment.apiUrl}/Category`, createDTO)
      .pipe(
        map(response => {
          console.log('Create Category Response:', response);
          
          if (response && response.data) {
            const newCategory = this.mapToICategory(response.data);
            this.categories.push(newCategory);
            this.categoriesSubject.next([...this.categories]);
            return newCategory;
          } else {
            throw new Error('Failed to create category');
          }
        }),
        catchError(error => {
          console.error('Error creating category:', error);
          return throwError(() => error);
        })
      );
  }

  // Update existing category
  updateCategory(id: number, categoryData: Partial<ICategory>): Observable<ICategory | null> {
    const updateDTO: UpdateCategoryDTO = {
      id: id,
      name: categoryData.name || '',
      description: categoryData.description || ''
    };

    return this.http.put<ApiResponse<CategoryResponseDTO>>(`${environment.apiUrl}/Category`, updateDTO)
      .pipe(
        map(response => {
          console.log('Update Category Response:', response);
          
          if (response && response.data) {
            const updatedCategory = this.mapToICategory(response.data);
            const index = this.categories.findIndex(c => c.id === id);
            if (index !== -1) {
              this.categories[index] = updatedCategory;
              this.categoriesSubject.next([...this.categories]);
            }
            return updatedCategory;
          } else {
            throw new Error('Failed to update category');
          }
        }),
        catchError(error => {
          console.error('Error updating category:', error);
          return throwError(() => error);
        })
      );
  }

  // Delete category
  deleteCategory(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<string>>(`${environment.apiUrl}/Category/${id}`)
      .pipe(
        map(response => {
          console.log('Delete Category Response:', response);
          
          // For delete operations, we consider it successful if we get any response
          // or if the status code is 200/204
          const index = this.categories.findIndex(c => c.id === id);
          if (index !== -1) {
            this.categories.splice(index, 1);
            this.categoriesSubject.next([...this.categories]);
          }
          return true;
        }),
        catchError(error => {
          console.error('Error deleting category:', error);
          return throwError(() => error);
        })
      );
  }

  // Toggle category active status (not implemented in backend, using update instead)
  toggleCategoryStatus(id: number): Observable<ICategory | null> {
    const category = this.categories.find(c => c.id === id);
    if (!category) {
      return of(null);
    }

    // Since backend doesn't have toggle, we'll just return the category
    // In a real implementation, you might want to add an isActive field to the backend
    return of(category);
  }

  // Map CategoryResponseDTO to ICategory
  private mapToICategory(categoryDTO: CategoryResponseDTO): ICategory {
    return {
      id: categoryDTO.id,
      name: categoryDTO.name,
      description: categoryDTO.description,
      createdAt: new Date(categoryDTO.createdAt),
      updatedAt: new Date(categoryDTO.updatedAt)
    };
  }

}
