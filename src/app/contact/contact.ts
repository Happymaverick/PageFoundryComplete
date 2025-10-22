import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
 contactForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder, public translate: TranslationService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      source: [''],
      message: ['', Validators.required],
      newsletter: [false]
    });
  }
  switchLanguage(lang: string) {
    this.translate.setLanguage(lang);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.contactForm.valid) {
      console.log('Submitted:', this.contactForm.value);
      alert('Message sent successfully!');
      this.contactForm.reset();
      this.submitted = false;
    }
  }
}