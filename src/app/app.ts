import { Component, signal, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslationService } from './services/translation.service';
import { Home } from './home/home';
import { About } from './about/about';
import { Projects } from './projects/projects';
import { Contact } from './contact/contact';
import { Login } from './login/login';
import { Signin } from './signin/signin';
import { Products } from './products/products';
import * as THREE from 'three';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterModule,
    Home,
    About,
    Contact,
    Projects,
    Login,
    Signin,
    Products
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnInit {
  showLogin = true;
  isSidebarOpen = false;
  isMobile = false;
  isLoggedIn = false;
  isAccountPage = false;

  protected readonly title = signal('PageFoundry');

  constructor(public translate: TranslationService, private router: Router) {}

  ngOnInit() {
    this.checkLogin();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());

    // 🔄 URL-Überwachung: prüft, ob aktuell auf /account
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAccountPage = event.url.startsWith('/account');
        if (this.isAccountPage) {
          // optional: automatisches Scroll-Reset
          window.scrollTo({ top: 0 });
        }
      });
  }

  // 🔐 Login / Logout
  checkLogin(): void {
    this.isLoggedIn = !!localStorage.getItem('user');
  }

  logout(): void {
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }

  // 📱 Sidebar-Handling
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 900;
    this.isSidebarOpen = !this.isMobile;
  }

  toggleSidebar() {
    if (this.isMobile) this.isSidebarOpen = !this.isSidebarOpen;
  }

  // 🌍 Sprache
  switchLanguage(lang: string) {
    this.translate.setLanguage(lang);
  }

  // 🔁 Login ↔ SignUp Umschalten
  toggleSignIn() {
    this.showLogin = false;
  }

  toggleLogin() {
    this.showLogin = true;
  }

  // 🔽 Smooth Scroll (nur auf Landing aktiv)
  scrollTo(sectionId: string) {
    if (this.isAccountPage) return;

    const target = document.getElementById(sectionId);
    if (!target) return;

    const doScroll = () => {
      const offset = 60;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: 'smooth' });
    };

    if (this.isMobile && this.isSidebarOpen) {
      this.isSidebarOpen = false;
      setTimeout(doScroll, 350);
    } else {
      doScroll();
    }
  }

  // 🌌 Hintergrund-Animation
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    const canvas = this.bgCanvas.nativeElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);

    const geometry = new THREE.PlaneGeometry(30, 20, 300, 300);
    const material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 1,
      roughness: 0.2,
      wireframe: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 50);
    pointLight.position.set(0, 0.2, 0);
    scene.add(pointLight);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = performance.now() * 0.0015;
      const positions = geometry.attributes['position'] as THREE.BufferAttribute;
      const count = positions.count;

      for (let i = 0; i < count; i++) {
        const y = Math.sin(i / 5 + time) * 0.15;
        positions.setZ(i, y);
      }

      positions.needsUpdate = true;
      mesh.rotation.z = Math.sin(time * 0.1) * 0.1;
      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}
