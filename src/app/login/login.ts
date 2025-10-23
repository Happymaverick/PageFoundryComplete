import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  @Output() switchToSignup = new EventEmitter<void>();

  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  message: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    public translate: TranslationService,
    private auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  switchLanguage(lang: string) {
    this.translate.setLanguage(lang);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToSignUp(event: Event): void {
    event.preventDefault();
    this.switchToSignup.emit();
  }

  onSubmit(): void {
    console.log('🟢 Login button clicked');
    if (this.loginForm.invalid) {
      this.message = 'Please enter valid credentials.';
      console.warn('⚠️ Invalid form:', this.loginForm.value);
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;
    console.log('Sending credentials:', credentials);

    this.auth.login(credentials).subscribe({
      next: (res) => {
        console.log('✅ Server response:', res);
        if (res.success) {
          this.message = 'Login successful!';
          localStorage.setItem('user', JSON.stringify(res.user));

          // 🔄 Direkt neu laden, damit Navbar & Zustand aktualisiert werden
          setTimeout(() => {
            window.location.reload();
          }, 400);
        } else {
          this.message = res.error || 'Invalid credentials.';
        }
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.message = err.error?.error || 'Server error.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
