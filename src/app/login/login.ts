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
    if (this.loginForm.invalid) {
      this.message = 'Please enter valid credentials.';
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.auth.login(credentials).subscribe({
      next: (res) => {
        if (res.success) {
          // Erwartet:
          // res.user = { id, firstname?, email, role }
          // res.token = '...'

          if (!res.user || !res.user.id || !res.user.role) {
            console.error('Login response missing id/role. Guards will fail.');
          }

          localStorage.setItem('user', JSON.stringify(res.user));
          if (res.token) {
            localStorage.setItem('token', res.token);
          }

          this.message = 'Login successful!';

          // reload to update navbar + routing
          setTimeout(() => {
            window.location.reload();
          }, 400);
        } else {
          this.message = res.error || 'Invalid credentials.';
        }
      },
      error: (err) => {
        this.message = err.error?.error || 'Server error.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
