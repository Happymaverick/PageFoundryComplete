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
    Signin],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  showLogin = true;

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
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
