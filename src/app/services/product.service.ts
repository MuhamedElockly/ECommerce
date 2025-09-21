import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Sample Product 1',
      description: 'This is a sample product description',
      price: 99.99,
      category: 'Electronics',
      imageUrl: 'https://via.placeholder.com/300x200',
      stock: 50,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Sample Product 2',
      description: 'Another sample product description',
      price: 149.99,
      category: 'Clothing',
      imageUrl: 'https://via.placeholder.com/300x200',
      stock: 25,
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ];

  private productsSubject = new BehaviorSubject<Product[]>(this.products);
  public products$ = this.productsSubject.asObservable();

  constructor() { }

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  // Get product by ID
  getProductById(id: number): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product);
  }

  // Create new product
  createProduct(productData: CreateProductRequest): Observable<Product> {
    const newProduct: Product = {
      id: this.generateId(),
      ...productData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.products.push(newProduct);
    this.productsSubject.next([...this.products]);
    return of(newProduct);
  }

  // Update existing product
  updateProduct(id: number, productData: UpdateProductRequest): Observable<Product | null> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return of(null);
    }

    this.products[index] = {
      ...this.products[index],
      ...productData,
      updatedAt: new Date()
    };

    this.productsSubject.next([...this.products]);
    return of(this.products[index]);
  }

  // Delete product
  deleteProduct(id: number): Observable<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return of(false);
    }

    this.products.splice(index, 1);
    this.productsSubject.next([...this.products]);
    return of(true);
  }

  // Toggle product active status
  toggleProductStatus(id: number): Observable<Product | null> {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      return of(null);
    }

    product.isActive = !product.isActive;
    product.updatedAt = new Date();
    this.productsSubject.next([...this.products]);
    return of(product);
  }

  // Generate unique ID
  private generateId(): number {
    return Math.max(...this.products.map(p => p.id), 0) + 1;
  }
}
