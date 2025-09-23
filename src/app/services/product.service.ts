import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/product.model';
import { ApiResponse, CreateProductDTO, UpdateProductDTO, ProductResponseDTO } from '../models/api-response.model';
import { CategoryService } from './category.service';
import { ICategory } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>(this.products);
  public products$ = this.productsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService
  ) { }

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<ProductResponseDTO[]>>(`${environment.apiUrl}/Product`)
      .pipe(
        map(response => {
          console.log('API Response (Products):', response);
          
          if (response && response.data) {
            const products = response.data.map(prod => this.mapToProduct(prod));
            this.products = products;
            this.productsSubject.next([...this.products]);
            return products;
          } else if (response && Array.isArray(response)) {
            // Handle case where API returns array directly
            const products = response.map(prod => this.mapToProduct(prod));
            this.products = products;
            this.productsSubject.next([...this.products]);
            return products;
          } else {
            console.error('Unexpected API response structure:', response);
            throw new Error('Unexpected API response structure');
          }
        }),
        catchError(error => {
          console.error('Error fetching products:', error);
          return throwError(() => error);
        })
      );
  }

  
  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<ApiResponse<ProductResponseDTO>>(`${environment.apiUrl}/Product/${id}`)
      .pipe(
        map(response => {
          console.log('Get Product by ID Response:', response);
          
          if (response && response.data) {
            return this.mapToProduct(response.data);
          } else {
            throw new Error('Product not found');
          }
        }),
        catchError(error => {
          console.error('Error fetching product:', error);
          return of(undefined);
        })
      );
  }

 
  createProduct(productData: CreateProductRequest): Observable<Product> {
    return this.getCategoryIdByName(productData.category).pipe(
      switchMap(categoryId => {
        const formData = new FormData();
        
        
        formData.append('name', productData.name);
        formData.append('PCode', productData.productCode);
        formData.append('price', productData.price.toString());
        formData.append('categoryId', categoryId.toString());
        formData.append('stock', productData.stock.toString());
        
      
        if (productData.image) {
          formData.append('image', productData.image);
        }

        return this.http.post<ApiResponse<ProductResponseDTO>>(`${environment.apiUrl}/Product`, formData);
      }),
      map(response => {
        console.log('Create Product Response:', response);
        
        if (response && response.data) {
          const newProduct = this.mapToProduct(response.data);
          this.products.push(newProduct);
          this.productsSubject.next([...this.products]);
          return newProduct;
        } else {
          throw new Error('Failed to create product');
        }
      }),
      catchError(error => {
        console.error('Error creating product:', error);
        return throwError(() => error);
      })
    );
  }


 
  updateProduct(id: number, productData: UpdateProductRequest): Observable<Product | null> {
    return this.getCategoryIdByName(productData.category ?? '').pipe(
      switchMap(categoryId => {
        const formData = new FormData();
        
        
        formData.append('id', id.toString());
        formData.append('name', productData.name ?? '');
        formData.append('PCode', productData.productCode ?? '');
        formData.append('price', (productData.price ?? 0).toString());
        formData.append('categoryId', categoryId.toString());
        formData.append('stock', (productData.stock ?? 0).toString());
        
     
        if (productData.image) {
          formData.append('image', productData.image);
        }

        return this.http.put<ApiResponse<ProductResponseDTO>>(`${environment.apiUrl}/Product`, formData);
      }),
      map(response => {
        console.log('Update Product Response:', response);
        
        if (response && response.data) {
          const updatedProduct = this.mapToProduct(response.data);
          const index = this.products.findIndex(p => p.id === id);
          if (index !== -1) {
            this.products[index] = updatedProduct;
            this.productsSubject.next([...this.products]);
          }
          return updatedProduct;
        } else {
          throw new Error('Failed to update product');
        }
      }),
      catchError(error => {
        console.error('Error updating product:', error);
        return throwError(() => error);
      })
    );
  }

 
  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<string>>(`${environment.apiUrl}/Product/${id}`)
      .pipe(
        map(response => {
       
          
                 const index = this.products.findIndex(p => p.id === id);
          if (index !== -1) {
            this.products.splice(index, 1);
            this.productsSubject.next([...this.products]);
          }
          return true;
        }),
        catchError(error => {
        
          return throwError(() => error);
        })
      );
  }


 
  private mapToProduct(productDTO: ProductResponseDTO): Product {
    return {
      id: productDTO.id,
      name: productDTO.name,
      productCode: productDTO.pCode, 
      price: productDTO.finalPrice, 
      category: productDTO.categoryName || 'Uncategorized', 
      imageUrl: this.getFullImageUrl(productDTO.imageUrl),
      stock: productDTO.quantity, 
    
    };
  }

 
  private getFullImageUrl(imageUrl: string): string {
    if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'df') {
      return 'assets/images/no-image.svg';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (!imageUrl.includes('/') && imageUrl.includes('.')) {
      return `${environment.filesBaseUrl}/images/products/${imageUrl}`;
    }

    const normalized = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    if (normalized.startsWith('/images/')) {
      return `${environment.filesBaseUrl}${normalized}`;
    }
    return `${environment.filesBaseUrl}${normalized}`;
  }

  private getCategoryIdByName(categoryName: string): Observable<number> {
    return this.categoryService.getActiveCategories().pipe(
      map(categories => {
        const category = categories.find(cat => cat.name === categoryName);
        if (category && category.id) {
          return category.id;
        }
        return categories.length > 0 && categories[0].id ? categories[0].id : 1;
      }),
      catchError(error => {
        console.error('Error getting category ID:', error);
        return of(1); 
      })
    );
  }
}
