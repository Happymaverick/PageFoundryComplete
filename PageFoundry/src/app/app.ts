import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './services/translation.service';
import { RouterLink } from '@angular/router';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
  imports: [
    CommonModule,
    Home,
    About,
    Projects,
    Contact,
    Login,
    Signin,
    Products],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  showLogin = true;
  isSidebarOpen = false;
  isMobile = false;

  ngOnInit() {
  this.checkScreenSize();
  window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
  this.isMobile = window.innerWidth <= 900;
  if (!this.isMobile) this.isSidebarOpen = true;
  else this.isSidebarOpen = false;
  }

  toggleSidebar() {
  if (this.isMobile) {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  }


  protected readonly title = signal('PageFoundry');
  
    constructor(public translate: TranslationService) {}
  
    
     switchLanguage(lang: string) {
      this.translate.setLanguage(lang);
    }

  toggleSignIn() {
    this.showLogin = false;
  }

  toggleLogin() {
    this.showLogin = true;
  }

scrollTo(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const doScroll = () => {
    const offset = 60;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: 'smooth' });
  };

  if (this.isMobile && this.isSidebarOpen) {
    this.isSidebarOpen = false;

    const sidebarEl = document.querySelector('.sidebar') as HTMLElement | null;

    if (sidebarEl) {
      let handled = false;

      const onTransitionEnd = (ev?: TransitionEvent) => {
        if (ev && ev.propertyName && !['transform', 'opacity', 'top', 'left'].includes(ev.propertyName)) {
          return;
        }
        if (handled) return;
        handled = true;
        sidebarEl.removeEventListener('transitionend', onTransitionEnd as EventListener);
        setTimeout(doScroll, 10);
      };

      sidebarEl.addEventListener('transitionend', onTransitionEnd as EventListener);

      setTimeout(() => {
        if (!handled) {
          handled = true;
          sidebarEl.removeEventListener('transitionend', onTransitionEnd as EventListener);
          doScroll();
        }
      }, 600);

    } else {
      setTimeout(doScroll, 350);
    }

  } else {
    doScroll();
  }
}


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
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 50);
    pointLight.position.set(0, 0.2, 0);
    scene.add(pointLight);


    function animate() {
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
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}
