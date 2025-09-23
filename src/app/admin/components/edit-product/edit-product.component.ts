import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product, UpdateProductRequest } from '../../../models/product.model';
import { ICategory } from '../../../models/category.model';

@Component({
  selector: 'app-edit-product',
  standalone: false,
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  isSubmitting = false;
  isLoading = true;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  categories: ICategory[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.categoryService.getActiveCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories = categories;
      });
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(product => {
        if (product) {
          this.product = product;
        } else {
          this.router.navigate(['/admin/products']);
        }
        this.isLoading = false;
      });
  }

  onSubmit(form: any): void {
    if (form.valid && !this.isSubmitting && this.product) {
      this.isSubmitting = true;
      const productData: UpdateProductRequest = {
        id: this.product.id,
        name: form.value.name,
        productCode: form.value.productCode,
        price: form.value.price,
        category: form.value.category,
        stock: form.value.stock,
        image: this.selectedImage || undefined
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
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image size should not exceed 5MB');
        return;
      }

      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }
}
