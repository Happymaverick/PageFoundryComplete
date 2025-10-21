import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TranslationService } from '../services/translation.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
   @Output() switchToSignup = new EventEmitter<void>();
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  message: string = '';
  isLoading = false;

  constructor(private fb: FormBuilder, public translate: TranslationService, private auth: AuthService) {
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

    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.message = 'Login successful!';
          localStorage.setItem('user', JSON.stringify(res.user));
        } else {
          this.message = res.error || 'Invalid credentials.';
        }
      },
      error: (err) => {
        this.message = err.error?.error || 'Server error.';
      },
      complete: () => (this.isLoading = false)
    });
  }
}