import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { TranslationService } from '../services/translation.service';


@Component({
  selector: 'app-signin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {
   @Output() switchToLogin = new EventEmitter<void>();
  signInForm: FormGroup;
  submitted = false;
  showPassword = false;
  message: string = '';
  isSubmitting = false;

  constructor(private fb: FormBuilder, public translate: TranslationService, private auth: AuthService) {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      forename: ['', Validators.required],
      surname: ['', Validators.required],
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
     if (this.signInForm.invalid) {
      this.message = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;

    this.auth.register(this.signInForm.value).subscribe({
      next: (res) => {
        this.message = res.message || 'Registration successful!';
        this.signInForm.reset();
      },
      error: (err) => {
        this.message = err.error?.error || 'Registration failed.';
      },
      complete: () => (this.isSubmitting = false)
    });
  }
}