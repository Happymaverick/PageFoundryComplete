import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Projects } from './projects/projects';
import { Contact } from './contact/contact';
import { Login } from './login/login';
import { AuthGuard } from './guards/auth.guard'; // <— wird gleich erstellt

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'projects', component: Projects },
  { path: 'contact', component: Contact },
  { path: 'login', component: Login },

  // ✅ Lazy Loaded Account Page
  {
    path: 'account',
    loadComponent: () => import('./account/account.component').then(m => m.AccountComponent),
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: 'contact' }
];
