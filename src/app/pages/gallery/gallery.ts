import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PreloadService } from '../../services/preload.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-gallery',
  standalone: false,
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss'
})
export class Gallery implements OnInit {
  mainImages: any[] = [];
  studentsImages: any[] = [];
  isLoading = true;
  
  activeTab: 'main' | 'students' = 'main';
  isLightboxOpen = false;
  selectedImage: any = null;

  constructor(private cdr: ChangeDetectorRef, private preloadService: PreloadService, private router: Router) {}

  ngOnInit() {
    this.showGallery();
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd && e.urlAfterRedirects === '/gallery') {
        this.showGallery();
      }
    });
  }

  showGallery() {
    this.isLoading = true;
    const d = this.preloadService.data;
    if (!d) {
      setTimeout(() => this.showGallery(), 200);
      return;
    }
    
    this.mainImages = d.gallery || [];
    this.studentsImages = [...(d.winners || []), ...(d.prizers || [])]
      .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
    
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  setTab(tab: 'main' | 'students') { this.activeTab = tab; }
  get currentImages() { return this.activeTab === 'main' ? this.mainImages : this.studentsImages; }
  openLightbox(image: any) { this.selectedImage = image; this.isLightboxOpen = true; document.body.style.overflow = 'hidden'; }
  closeLightbox() { this.isLightboxOpen = false; this.selectedImage = null; document.body.style.overflow = ''; }
}