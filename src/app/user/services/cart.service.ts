import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem, CartSummary } from '../models/cart.model';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'ecommerce_cart';
  private cartSubject = new BehaviorSubject<Cart>(this.loadCartFromStorage());
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    // Initialize cart from localStorage
    this.cartSubject.next(this.loadCartFromStorage());
  }

  // Add item to cart
  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(item => item.productId === product.id);

    if (existingItemIndex > -1) {
      // Update existing item quantity
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const cartItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl,
        productCode: product.productCode
      };
      currentCart.items.push(cartItem);
    }

    this.updateCart(currentCart);
  }

  // Remove item from cart
  removeFromCart(productId: number): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.productId !== productId);
    this.updateCart(currentCart);
  }

  // Update item quantity
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex > -1) {
      currentCart.items[itemIndex].quantity = quantity;
      this.updateCart(currentCart);
    }
  }

  // Clear entire cart
  clearCart(): void {
    const emptyCart: Cart = {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
    this.updateCart(emptyCart);
  }

  // Get cart summary
  getCartSummary(): Observable<CartSummary> {
    return new Observable(observer => {
      this.cart$.subscribe(cart => {
        const summary: CartSummary = {
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          itemCount: cart.items.length
        };
        observer.next(summary);
      });
    });
  }

  // Get current cart
  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  // Check if product is in cart
  isInCart(productId: number): boolean {
    return this.cartSubject.value.items.some(item => item.productId === productId);
  }

  // Get quantity of specific product in cart
  getProductQuantity(productId: number): number {
    const item = this.cartSubject.value.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  // Private methods
  private updateCart(cart: Cart): void {
    // Calculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Update subject
    this.cartSubject.next(cart);

    // Save to localStorage
    this.saveCartToStorage(cart);
  }

  private loadCartFromStorage(): Cart {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      if (stored) {
        const cart = JSON.parse(stored);
        // Ensure cart has all required properties
        return {
          items: cart.items || [],
          totalItems: cart.totalItems || 0,
          totalPrice: cart.totalPrice || 0
        };
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }

    // Return empty cart if loading fails
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
  }

  private saveCartToStorage(cart: Cart): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }
}





