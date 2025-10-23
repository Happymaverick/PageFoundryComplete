import { Component } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {

  constructor(public translate: TranslationService) {}

  
   switchLanguage(lang: string) {
    this.translate.setLanguage(lang);
  } 

}
