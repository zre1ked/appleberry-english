import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VkService } from '../../services/vk.service';

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

  constructor(private cdr: ChangeDetectorRef, private vkService: VkService) {}

  ngOnInit() {
    this.loadGallery();
  }

  async loadGallery() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    try {
      const galleryPosts = await this.vkService.getPostsByHashtag('Галерея');
      const winners = await this.vkService.getPostsByHashtag('Победитель');
      const prizers = await this.vkService.getPostsByHashtag('Призер');
      
      this.mainImages = galleryPosts;
      this.studentsImages = [...winners, ...prizers].filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      );
    } catch (err) {
      console.error('Error loading gallery:', err);
    }
    
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  setTab(tab: 'main' | 'students') {
    this.activeTab = tab;
  }

  get currentImages() {
    return this.activeTab === 'main' ? this.mainImages : this.studentsImages;
  }

  openLightbox(image: any) {
    this.selectedImage = image;
    this.isLightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.selectedImage = null;
    document.body.style.overflow = '';
  }
}