import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerData: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 0
  };
  
  loading = false;
  error: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Clear any previous errors
    this.authService.clearError();
    
    // Subscribe to auth state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.loading = state.loading;
        this.error = state.error;
        
        // Redirect if already authenticated
        if (state.isAuthenticated && state.user) {
          this.redirectAfterRegister(state.user.role);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.authService.register(this.registerData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Registration successful:', response);
            
            // If registration succeeded but no auto-login, show success message
            if (response.success && !response.data.accessToken) {
              // Registration successful - redirect to login
              this.router.navigate(['/login'], { 
                queryParams: { message: 'Registration successful! Please log in.' } 
              });
            }
            // If auto-login happened, navigation will be handled by auth state subscription
          },
          error: (error) => {
            console.error('Registration error:', error);
            // Error is handled by the auth service
          }
        });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearError(): void {
    this.authService.clearError();
  }

  private isFormValid(): boolean {
    return this.registerData.firstName.trim() !== '' &&
           this.registerData.lastName.trim() !== '' &&
           this.registerData.email.trim() !== '' &&
           this.registerData.phoneNumber.trim() !== '' &&
           this.registerData.password.trim() !== '' &&
           this.registerData.confirmPassword.trim() !== '' &&
           this.passwordsMatch();
  }

  passwordsMatch(): boolean {
    return this.registerData.password === this.registerData.confirmPassword;
  }

  private redirectAfterRegister(role: 'admin' | 'customer'): void {
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/user']);
    }
  }
}
