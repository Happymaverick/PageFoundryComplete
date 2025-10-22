import { Component } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {

  constructor( public translate: TranslationService){

  }
  switchLanguage(lang: string) {
    this.translate.setLanguage(lang);
  }
}
