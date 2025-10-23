import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private language = new BehaviorSubject<string>('en');
  private translations: any = {};

  constructor(private http: HttpClient) {
    this.loadLanguage('en');
  }

  get currentLang() {
    return this.language.value;
  }

  setLanguage(lang: string) {
    this.language.next(lang);
    this.loadLanguage(lang);
  }

  private loadLanguage(lang: string) {
    this.http.get(`assets/${lang}.json`).subscribe(data => {
      this.translations = data;
    });
  }

  translate(key: string): string {
    return this.translations[key] || key;
  }
}
