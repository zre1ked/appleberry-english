import { Injectable } from '@angular/core';
import { VkService } from './vk.service';

@Injectable({
  providedIn: 'root'
})
export class PreloadService {
  public data: any = null;
  public ready = false;

  constructor(private vkService: VkService) {}

  async load() {
    if (this.ready) return;
    
    console.log('🚀 Preloading...');
    
    try {
      const [blog, colleagues, parents, students, inclusive, diplomas, gramotas, nagrady, gallery, winners, prizers] = await Promise.all([
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
      ]);

      // Грузим новости
      const news = await this.loadNews();

      this.data = { blog, colleagues, parents, students, inclusive, diplomas, gramotas, nagrady, gallery, winners, prizers, news };
      this.ready = true;
      console.log('✅ Preloading done!');
    } catch (e) {
      console.error('Preload error:', e);
      this.ready = true;
    }
  }

  private async loadNews(): Promise<any[]> {
    try {
      const posts: any[] = [];
      const maxPages = 5;
      
      for (let page = 1; page <= maxPages; page++) {
        const pageUrl = page === 1 
          ? 'https://admsurgut.ru/novosti/' 
          : `https://admsurgut.ru/novosti/?PAGEN_1=${page}`;
        
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(pageUrl);
        const response = await fetch(proxyUrl);
        const html = await response.text();
        
        const cards = html.split('news-main-card__content');
        
        for (let i = 1; i < cards.length; i++) {
          const card = cards[i];
          const dateMatch = card.match(/news-main-card__date">([^<]*)</);
          const titleMatch = card.match(/news-main-card__title">([^<]*)</);
          const prevBlock = cards[i - 1];
          const linkMatch = prevBlock.match(/href="(\/novosti\/detail\.php\?ID=\d+)"/);
          const imgMatch = prevBlock.match(/news-main-card__image"\s+src="([^"]*)"/);
          
          if (titleMatch && dateMatch) {
            const image = imgMatch ? (imgMatch[1].startsWith('http') ? imgMatch[1] : 'https://admsurgut.ru' + imgMatch[1]) : '';
            posts.push({
              id: Math.random(),
              text: titleMatch[1].trim(),
              shortText: titleMatch[1].trim(),
              date: dateMatch[1].trim(),
              image, images: image ? [image] : [], hasImage: !!image,
              hasVideos: false, hasFiles: false,
              url: linkMatch ? 'https://admsurgut.ru' + linkMatch[1] : 'https://admsurgut.ru/novosti/',
              isLong: false, hashtags: []
            });
          }
          if (posts.length >= 49) break;
        }
        if (posts.length >= 49) break;
      }
      
      if (posts.length > 0) {
        posts.push({
          id: Math.random(), text: 'Все новости администрации Сургута',
          shortText: 'Перейти на сайт администрации', date: '',
          image: '', images: [], hasImage: false, hasVideos: false, hasFiles: false,
          url: 'https://admsurgut.ru/novosti/', isLong: false, hashtags: []
        });
      }
      
      return posts.length > 0 ? posts : [{
        id: 1, text: 'Новости администрации Сургута',
        shortText: 'Перейти на сайт администрации', date: '',
        image: '', images: [], hasImage: false, hasVideos: false, hasFiles: false,
        url: 'https://admsurgut.ru/novosti/', isLong: false, hashtags: []
      }];
    } catch (e) { 
      return [{
        id: 1, text: 'Новости администрации Сургута',
        shortText: 'Перейти на сайт администрации', date: '',
        image: '', images: [], hasImage: false, hasVideos: false, hasFiles: false,
        url: 'https://admsurgut.ru/novosti/', isLong: false, hashtags: []
      }];
    }
  }
}