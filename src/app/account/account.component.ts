import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.html',
  styleUrls: ['./account.css']
})
export class AccountComponent implements OnInit {
  user: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // 🔹 User aus localStorage laden
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      console.log('✅ Logged in user:', this.user);
    } else {
      console.warn('⚠️ Kein eingeloggter Benutzer, Weiterleitung zum Login...');
      this.router.navigate(['/login']);
    }
  }

  navigate(section: string) {
    // 🔹 Platzhalter für spätere Unterseiten (Orders, Security, Payment, Delete, etc.)
    alert(`Navigate to: ${section}`);
  }
}
