import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { Product, UpdateProductRequest } from '../../../models/product.model';

@Component({
  selector: 'app-edit-product',
  standalone: false,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  product: Product | null = null;
  isSubmitting = false;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(product => {
        if (product) {
          this.product = product;
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            stock: product.stock,
            isActive: product.isActive
          });
        } else {
          this.router.navigate(['/admin/products']);
        }
        this.isLoading = false;
      });
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting && this.product) {
      this.isSubmitting = true;
      const productData: UpdateProductRequest = {
        id: this.product.id,
        ...this.productForm.value
      };
      
      this.productService.updateProduct(this.product.id, productData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedProduct) => {
            if (updatedProduct) {
              console.log('Product updated successfully:', updatedProduct);
              this.router.navigate(['/admin/products']);
            } else {
              alert('Failed to update product');
              this.isSubmitting = false;
            }
          },
          error: (error) => {
            console.error('Error updating product:', error);
            alert('Error updating product');
            this.isSubmitting = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['min']) {
        return `${fieldName} must be greater than ${control.errors['min'].min}`;
      }
      if (control.errors['pattern']) {
        return `${fieldName} must be a valid image URL`;
      }
    }
    return '';
  }
}
