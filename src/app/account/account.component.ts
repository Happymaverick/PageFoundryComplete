import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Renderer2 } from '@angular/core';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.html',
  styleUrls: ['./account.css']
})
export class AccountComponent implements OnInit, OnDestroy {
  user: any = null;
  private menuBtn: HTMLElement | null = null;
  private sidebar: HTMLElement | null = null;

  constructor(
    public router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

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

    // 🔹 Menü & Sidebar nur auf Account-Seite ausblenden
    this.menuBtn = this.document.querySelector('button.menu-toggle');
    this.sidebar = this.document.querySelector('.sidebar');

    if (this.menuBtn) this.renderer.setStyle(this.menuBtn, 'display', 'none');
    if (this.sidebar) this.renderer.setStyle(this.sidebar, 'display', 'none');
  }

  ngOnDestroy(): void {
    // 🔹 Ursprüngliche Anzeige wiederherstellen, falls Seite gewechselt wird
    if (this.menuBtn) this.renderer.removeStyle(this.menuBtn, 'display');
    if (this.sidebar) this.renderer.removeStyle(this.sidebar, 'display');
  }

  navigate(section: string): void {
    // 🔹 Platzhalter für spätere Unterseiten (Orders, Security, Payment, Delete, etc.)
    alert(`Navigate to: ${section}`);
  }
}
