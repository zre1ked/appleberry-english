import { Injectable } from '@angular/core';

export interface VkPost {
  id: number;
  text: string;
  shortText: string;
  date: string;
  image: string;
  images: string[];
  hasImage: boolean;
  hasFiles: boolean;
  fileCount: number;
  videos: any[];
  hasVideos: boolean;
  url: string;
  isLong: boolean;
  hashtags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class VkService {
  private readonly TOKEN = '96f77e7296f77e7296f77e727495b6c4ba996f796f77e72fcc62ebbb990061b01f6dba5';
  private readonly GROUP_ID = -217051989;
  private readonly GROUP_URL = 'https://vk.ru/appleberryenglishschool';
  private readonly VERSION = '5.199';

  async getAllPosts(): Promise<VkPost[]> {
    const allItems: any[] = [];
    let offset = 0;
    const batchSize = 100;
    
    // Получаем общее количество
    const first = await this.callApi(0, 1);
    if (!first?.response?.count) return [];
    
    const total = Math.min(first.response.count, 500);
    
    while (offset < total) {
      const data = await this.callApi(offset, batchSize);
      if (data?.response?.items) {
        allItems.push(...data.response.items);
      }
      offset += batchSize;
    }

    return this.transform(allItems);
  }

  async getPostsByHashtag(hashtag: string): Promise<VkPost[]> {
    const all = await this.getAllPosts();
    return all.filter(p => p.hashtags.includes(hashtag));
  }

  // ========== ПРИВАТНЫЕ МЕТОДЫ ==========

  private async callApi(offset: number, count: number): Promise<any> {
    const url = `https://api.vk.com/method/wall.get?owner_id=${this.GROUP_ID}&offset=${offset}&count=${count}&filter=all&access_token=${this.TOKEN}&v=${this.VERSION}`;
    
    // Пробуем JSONP
    try {
      const data = await this.jsonp(url);
      if (data?.response) return data;
    } catch (e) {
      console.warn('JSONP failed, trying proxy');
    }
    
    // Пробуем прокси
    try {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      return await res.json();
    } catch (e) {
      console.error('Proxy failed:', e);
      return null;
    }
  }

  private jsonp(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const name = 'cb' + Date.now() + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      
      const cleanup = () => {
        delete (window as any)[name];
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      (window as any)[name] = (data: any) => {
        cleanup();
        resolve(data);
      };

      script.src = url + '&callback=' + name;
      script.onerror = () => {
        cleanup();
        reject(new Error('JSONP error'));
      };

      setTimeout(() => {
        cleanup();
        reject(new Error('JSONP timeout'));
      }, 10000);

      document.body.appendChild(script);
    });
  }

  private transform(items: any[]): VkPost[] {
    const seen = new Set<number>();
    const result: VkPost[] = [];

    for (const item of items) {
      // Пропускаем дубликаты
      if (seen.has(item.id)) continue;
      seen.add(item.id);

      // Пропускаем посты БЕЗ текста И БЕЗ вложений
      const text = (item.text || '').trim();
      const hasAttachments = item.attachments && item.attachments.length > 0;
      if (!text && !hasAttachments) continue;

      const images = this.extractImages(item.attachments);
      const videos = this.extractVideos(item.attachments);
      const files = this.countFiles(item.attachments);
      const hashtags = this.extractHashtags(text);

      result.push({
        id: item.id,
        text: text || 'Без текста',
        shortText: text.length > 150 ? text.slice(0, 150) + '...' : (text || 'Без текста'),
        date: new Date(item.date * 1000).toLocaleDateString('ru-RU', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        image: images[0] || '',
        images,
        hasImage: images.length > 0,
        hasFiles: files > 0,
        fileCount: files,
        videos,
        hasVideos: videos.length > 0,
        url: `${this.GROUP_URL}?w=wall${item.owner_id}_${item.id}`,
        isLong: text.length > 150,
        hashtags
      });
    }

    return result;
  }

  private extractImages(attachments: any[]): string[] {
    if (!attachments) return [];
    return attachments
      .filter((a: any) => a.type === 'photo' && a.photo?.sizes)
      .map((a: any) => {
        const max = a.photo.sizes.reduce((best: any, cur: any) =>
          best.width * best.height > cur.width * cur.height ? best : cur
        );
        return max.url;
      });
  }

  private extractVideos(attachments: any[]): any[] {
    if (!attachments) return [];
    return attachments
      .filter((a: any) => a.type === 'video')
      .map((a: any) => ({
        id: a.video?.id,
        owner_id: a.video?.owner_id,
        title: a.video?.title || 'Видео',
        image: a.video?.image?.[a.video.image.length - 1]?.url || ''
      }));
  }

  private countFiles(attachments: any[]): number {
    if (!attachments) return 0;
    return attachments.filter((a: any) => a.type === 'doc').length;
  }

  private extractHashtags(text: string): string[] {
    const result: string[] = [];
    const regex = /#([\wа-яё]+)/gi;
    let m;
    while ((m = regex.exec(text)) !== null) {
      const tag = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
      result.push(tag);
    }
    return result;
  }
}