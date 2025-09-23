import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../../models/product.model';
import { ICategory } from '../../../models/category.model';
import { CartSummary } from '../../models/cart.model';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.css']
})
export class ProductCatalogComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  categoriesLoading = false;
  error: string | null = null;
  searchTerm = '';
  selectedCategory = '';
  categories: ICategory[] = [];
  cartSummary: CartSummary = { totalItems: 0, totalPrice: 0, itemCount: 0 };
  
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.subscribeToCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filteredProducts = [...products];
          this.loading = false;
        },
        error: (error) => {
         
          this.error = 'Failed to load products. Please try again.';
          this.loading = false;
        }
      });
  }

  loadCategories(): void {
    this.categoriesLoading = true;
    
    this.categoryService.getActiveCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.categoriesLoading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.categoriesLoading = false;
       
        }
      });
  }

  


  subscribeToCart(): void {
    this.cartService.getCartSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.products];
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.productCode.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    this.filteredProducts = filtered;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  isInCart(productId: number): boolean {
    return this.cartService.isInCart(productId);
  }

  getProductQuantity(productId: number): number {
    return this.cartService.getProductQuantity(productId);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.applyFilters();
  }
}
