import { Injectable } from '@angular/core';
import { VkService } from './vk.service';

@Injectable({
  providedIn: 'root'
})
export class PreloadService {
  private preloaded = false;

  constructor(private vkService: VkService) {}

  // Вызвать из app.component при старте
  async preload() {
    if (this.preloaded) return;
    this.preloaded = true;
    
    console.log('🚀 Preloading started...');
    
    // Загружаем всё в фоне
    Promise.all([
      this.vkService.getPostsByHashtag('Блог'),
      this.vkService.getPostsByHashtag('Коллегам'),
      this.vkService.getPostsByHashtag('Родителям'),
      this.vkService.getPostsByHashtag('Ученикам'),
      this.vkService.getPostsByHashtag('ОсобенныеДети'),
      this.vkService.getPostsByHashtag('Диплом'),
      this.vkService.getPostsByHashtag('Грамота'),
      this.vkService.getPostsByHashtag('Награда'),
      this.vkService.getPostsByHashtag('Галерея'),
      this.vkService.getPostsByHashtag('Победитель'),
      this.vkService.getPostsByHashtag('Призер'),
    ]).then(() => {
      console.log('✅ Preloading complete!');
    });
  }
}