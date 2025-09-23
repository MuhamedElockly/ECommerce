import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  
  loading = false;
  error: string | null = null;
  showPassword = false;
  successMessage: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Clear any previous errors
    this.authService.clearError();
    
    // Check for success message from registration
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
      }
    });
    
    // Subscribe to auth state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.loading = state.loading;
        this.error = state.error;
        
        // Redirect if already authenticated
        if (state.isAuthenticated && state.user) {
          this.redirectAfterLogin(state.user.role);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.authService.login(this.loginData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            // Navigation will be handled by the auth state subscription
            console.log('Login successful:', response);
          },
          error: (error) => {
            console.error('Login error:', error);
            // Error is handled by the auth service
          }
        });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.authService.clearError();
  }

  clearSuccessMessage(): void {
    this.successMessage = null;
  }

  private isFormValid(): boolean {
    return this.loginData.email.trim() !== '' && 
           this.loginData.password.trim() !== '';
  }

  private redirectAfterLogin(role: 'admin' | 'customer'): void {
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/user']);
    }
  }
}


