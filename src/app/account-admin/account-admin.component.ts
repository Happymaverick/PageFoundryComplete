import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Renderer2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-admin.html',
  styleUrls: ['./account-admin.css']
})
export class AccountComponent implements OnInit, OnDestroy {
  user: any = null;

  // neue State-Blöcke
  nextConsulting: any = null;
  projects: any[] = [];

  private menuBtn: HTMLElement | null = null;
  private pageWrapper: HTMLElement | null = null;
  private sidebar: HTMLElement | null = null;

  constructor(
    public router: Router,
    private renderer: Renderer2,
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    // User holen
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch {
        this.user = null;
      }
    }

    // if kein User -> redirect login
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // Layout-Manipulation nur für Account
    this.menuBtn = this.document.querySelector('button.menu-toggle');
    this.sidebar = this.document.querySelector('.sidebar');
    this.pageWrapper = this.document.querySelector('.account-page-wrapper');

    if (this.menuBtn) this.renderer.setStyle(this.menuBtn, 'display', 'none');
    if (this.sidebar) this.renderer.setStyle(this.sidebar, 'display', 'none');
    if (this.pageWrapper) this.renderer.removeStyle(this.pageWrapper, 'width'); // width deaktivieren

    // Dashboard-Daten laden
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    // Layout zurücksetzen
    if (this.menuBtn) this.renderer.removeStyle(this.menuBtn, 'display');
    if (this.sidebar) this.renderer.removeStyle(this.sidebar, 'display');
    if (this.pageWrapper) this.renderer.removeStyle(this.pageWrapper, 'width');
  }

  navigate(section: string): void {
    alert(`Navigate to: ${section}`);
  }

  // -------------------------------------------------
  // Neues: Daten vom Backend ziehen
  // -------------------------------------------------
private loadDashboardData(): void {
  const token = localStorage.getItem('token') || '';

  console.log('[Account] Fetching dashboard data with token:', token);

  this.http.get(
    '/PageFoundryBackend/api/get_customer_dashboard.php',
    {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    }
  ).subscribe({
    next: (res: any) => {
      console.log('[Account] API response:', res);

      this.nextConsulting = res?.nextConsulting || null;
      this.projects = Array.isArray(res?.projects) ? res.projects : [];

      console.log('[Account] nextConsulting after assign:', this.nextConsulting);
      console.log('[Account] projects after assign:', this.projects);
    },
    error: (err: any) => {
      console.error('[Account] Dashboard load error:', err);

      // DEV FALLBACK, damit du sofort was siehst
      this.nextConsulting = {
        timestamp_start: '2025-10-28 14:30',
        zoom_url: 'https://zoom.us/j/9876543210',
        goal: 'Landingpage Audit'
      };

      this.projects = [
        {
          package_id: 'landingpage',
          status: 'in_bearbeitung',
          last_status_update: '2025-10-23 09:41',
          deadline_note: 'Launch before Black Friday'
        }
      ];

      console.log('[Account] using fallback demo data');
    }
  });
}


  // User-facing Statusmapping
  mapStatusHuman(status: string): string {
    switch (status) {
      case 'eingegangen': return 'Auftrag empfangen';
      case 'in_bearbeitung': return 'In Bearbeitung';
      case 'wartet_auf_kunde': return 'Warten auf Input';
      case 'review_intern': return 'Interne Prüfung';
      case 'fertig': return 'Bereit zur Abnahme';
      case 'abgeschlossen': return 'Abgeschlossen';
      default: return status || 'Unbekannt';
    }
  }
}
