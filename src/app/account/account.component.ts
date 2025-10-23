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
  private pageWrapper: HTMLElement | null = null;
  private sidebar: HTMLElement | null = null;

  constructor(
    public router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    // User aus localStorage laden
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      console.log('✅ Logged in user:', this.user);
    } else {
      console.warn('⚠️ Kein eingeloggter Benutzer, Weiterleitung zum Login...');
      this.router.navigate(['/login']);
    }

    // === Layout Fixes nur für Account ===
    this.menuBtn = this.document.querySelector('button.menu-toggle');
    this.sidebar = this.document.querySelector('.sidebar');
    this.pageWrapper = this.document.querySelector('.account-page-wrapper');

    if (this.menuBtn) this.renderer.setStyle(this.menuBtn, 'display', 'none');
    if (this.sidebar) this.renderer.setStyle(this.sidebar, 'display', 'none');
    if (this.pageWrapper) this.renderer.removeStyle(this.pageWrapper, 'width'); // width deaktivieren
  }

  ngOnDestroy(): void {
    // Beim Verlassen Seite wiederherstellen
    if (this.menuBtn) this.renderer.removeStyle(this.menuBtn, 'display');
    if (this.sidebar) this.renderer.removeStyle(this.sidebar, 'display');
    if (this.pageWrapper) this.renderer.removeStyle(this.pageWrapper, 'width');
  }

  navigate(section: string): void {
    alert(`Navigate to: ${section}`);
  }
}
