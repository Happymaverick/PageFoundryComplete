import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-account-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-admin.html',
  styleUrl: './account-admin.css'
})
export class AccountAdminComponent implements OnInit {
  consultingLeads = signal<any[]>([]);
  paidOrders = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMsg = signal<string>('');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

  private loadAdminData(): void {
    const token = localStorage.getItem('token') || '';
    console.log('[Admin] fetching dashboard with token:', token);

    this.http.get(
      // Prod ruft direkt /api/... auf.
      // Dev (ng serve) braucht /PageFoundryBackend/... wegen Proxy.
      (window.location.hostname === 'localhost'
        ? '/PageFoundryBackend/api/get_admin_dashboard.php'
        : '/api/get_admin_dashboard.php'),
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }
    ).subscribe({
      next: (res: any) => {
        console.log('[Admin] API response:', res);

        this.consultingLeads.set(
          Array.isArray(res?.consultingLeads) ? res.consultingLeads : []
        );

        this.paidOrders.set(
          Array.isArray(res?.paidOrders) ? res.paidOrders : []
        );

        this.loading.set(false);
        this.errorMsg.set('');
      },
      error: (err: any) => {
        console.error('[Admin] dashboard load error', err);
        this.errorMsg.set('Failed to load dashboard.');
        this.loading.set(false);
      }
    });
  }

  updateStatus(orderId: number, newStatus: string): void {
    const token = localStorage.getItem('token') || '';
    console.log('[Admin] updating order', orderId, '->', newStatus);

    this.http.post(
      (window.location.hostname === 'localhost'
        ? '/PageFoundryBackend/api/update_order_status.php'
        : '/api/update_order_status.php'),
      {
        order_id: orderId,
        status: newStatus
      },
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      }
    ).subscribe({
      next: (res: any) => {
        console.log('[Admin] update response:', res);

        const nextOrders = this.paidOrders().map(o => {
          if (o.id === orderId) {
            return { ...o, status: newStatus };
          }
          return o;
        });

        this.paidOrders.set(nextOrders);
      },
      error: (err: any) => {
        console.error('[Admin] status update failed', err);
      }
    });
  }

  mapStatusHuman(status: string): string {
    switch (status) {
      case 'eingegangen': return 'Eingegangen';
      case 'in_bearbeitung': return 'In Bearbeitung';
      case 'wartet_auf_kunde': return 'Warten auf Kunde';
      case 'review_intern': return 'Review intern';
      case 'fertig': return 'Fertig zur Abnahme';
      case 'abgeschlossen': return 'Abgeschlossen';
      default: return status || 'Unbekannt';
    }
  }
}
