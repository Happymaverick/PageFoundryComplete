import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css']
})
export class Signin {
  @Output() switchToLogin = new EventEmitter<void>();
  signInForm: FormGroup;
  submitted = false;
  showPassword = false;
  message: string = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public translate: TranslationService,
    private auth: AuthService
  ) {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstname: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      newsletter: [false]
    });
  }

  switchLanguage(lang: string) {
    this.translate.setLanguage(lang);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToLogin(event: Event): void {
    event.preventDefault();
    this.switchToLogin.emit();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.signInForm.invalid) {
      this.message = 'Please fill in all required fields correctly.';
      console.warn('⚠️ Invalid form:', this.signInForm.value);
      return;
    }

    console.log('🟢 Register button clicked');
    console.log('Sending registration data:', this.signInForm.value);

    this.isSubmitting = true;
    this.auth.register(this.signInForm.value).subscribe({
      next: (res) => {
        console.log('✅ Server response:', res);
        if (res.success) {
          this.message = 'Registration successful!';
          alert('✅ Registration successful. You can now log in.');
          this.signInForm.reset();
          this.switchToLogin.emit();
        } else {
          this.message = res.error || 'Registration failed.';
        }
      },
      error: (err) => {
        console.error('❌ Registration error:', err);
        this.message = err.error?.error || 'Server error during registration.';
      },
      complete: () => (this.isSubmitting = false)
    });
  }
}
