import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://PageFoundry.de/api';; // <- PHP Backend

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register.php`, userData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    }).pipe(
      map(res => res),
      catchError(err => throwError(() => err))
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login.php`, credentials, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    }).pipe(
      map(res => res),
      catchError(err => throwError(() => err))
    );
  }
}
