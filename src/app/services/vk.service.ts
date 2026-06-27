import { Injectable } from '@angular/core';

interface VkPost {
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
  private cachedPosts: VkPost[] = [];
  private cacheTime = 0;
  
  private accessToken = '96f77e7296f77e7296f77e727495b6c4ba996f796f77e72fcc62ebbb990061b01f6dba5';
  
  private groups = [
    { id: -217051989, url: 'https://vk.ru/appleberryenglishschool' },
  ];

  async getPosts(): Promise<VkPost[]> {
    if (this.cachedPosts.length > 0 && Date.now() - this.cacheTime < 300000) {
      return this.cachedPosts;
    }

    try {
      let allItems: any[] = [];

      for (const group of this.groups) {
        const items = await this.loadGroupPosts(group.id);
        allItems = allItems.concat(items);
      }

      allItems = allItems.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      );

      this.cachedPosts = this.processItems(allItems);
      this.cacheTime = Date.now();
      return this.cachedPosts;
      
    } catch (error) {
      console.error('Error:', error);
      return this.cachedPosts;
    }
  }

  private async loadGroupPosts(groupId: number): Promise<any[]> {
    let allItems: any[] = [];
    let offset = 0;
    const countPerRequest = 100;
    let totalCount = 0;

    const firstData = await this.apiRequest(groupId, 0, 1);
    if (firstData?.response) {
      totalCount = firstData.response.count || 0;
    }

    const maxPosts = Math.min(totalCount, 500);
    
    while (offset < maxPosts) {
      const count = Math.min(countPerRequest, maxPosts - offset);
      const data = await this.apiRequest(groupId, offset, count);
      
      if (data?.response?.items) {
        allItems = allItems.concat(data.response.items);
      }
      
      offset += countPerRequest;
    }

    return allItems;
  }

  private async apiRequest(groupId: number, offset: number, count: number): Promise<any> {
    const url = `https://api.vk.com/method/wall.get?owner_id=${groupId}&offset=${offset}&count=${count}&filter=all&access_token=${this.accessToken}&v=5.199`;
    
    const jsonpData = await this.jsonpRequest(url);
    if (jsonpData?.response) return jsonpData;
    
    return await this.proxyRequest(groupId, offset, count);
  }

  private processItems(items: any[]): VkPost[] {
    return items.map((item: any) => {
      const text = item.text || 'Без текста';
      let hashtags = this.extractHashtags(text);
      if (hashtags.length === 0) hashtags = ['Блог'];
      
      const images = this.getAllImages(item.attachments);
      const hasFiles = this.hasDocumentAttachments(item.attachments);
      const fileCount = this.getDocumentCount(item.attachments);
      const videos = this.getVideoAttachments(item.attachments);
      
      const group = this.groups.find(g => g.id === item.owner_id);
      const groupUrl = group ? group.url : this.groups[0].url;
      
      return {
        id: item.id,
        text: text,
        shortText: text.length > 150 ? text.substring(0, 150) + '...' : text,
        date: new Date(item.date * 1000).toLocaleDateString('ru-RU', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        image: images[0] || '',
        images: images,
        hasImage: images.length > 0,
        hasFiles: hasFiles,
        fileCount: fileCount,
        videos: videos,
        hasVideos: videos.length > 0,
        url: `${groupUrl}?w=wall${item.owner_id}_${item.id}`,
        isLong: text.length > 150,
        hashtags: hashtags
      };
    });
  }

  private getAllImages(attachments: any[]): string[] {
    if (!attachments?.length) return [];
    const images: string[] = [];
    attachments.forEach((item: any) => {
      if (item.type === 'photo' && item.photo?.sizes) {
        const max = item.photo.sizes.reduce((a: any, b: any) => 
          (a.width * a.height > b.width * b.height) ? a : b
        );
        if (max.url) images.push(max.url);
      }
    });
    return images;
  }

  private getVideoAttachments(attachments: any[]): any[] {
    if (!attachments?.length) return [];
    return attachments
      .filter((a: any) => a.type === 'video')
      .map((a: any) => ({
        id: a.video.id,
        owner_id: a.video.owner_id,
        title: a.video.title || 'Видео',
        image: a.video.image?.[a.video.image.length - 1]?.url || '',
      }));
  }

  private hasDocumentAttachments(attachments: any[]): boolean {
    if (!attachments?.length) return false;
    return attachments.some((a: any) => a.type === 'doc');
  }

  private getDocumentCount(attachments: any[]): number {
    if (!attachments?.length) return 0;
    return attachments.filter((a: any) => a.type === 'doc').length;
  }

  private jsonpRequest(url: string): Promise<any> {
    return new Promise((resolve) => {
      const callbackName = 'vkCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const script = document.createElement('script');
      let resolved = false;
      
      (window as any)[callbackName] = (data: any) => {
        if (!resolved) {
          resolved = true;
          delete (window as any)[callbackName];
          if (script.parentNode) script.parentNode.removeChild(script);
          resolve(data);
        }
      };
      
      script.src = url + '&callback=' + callbackName;
      script.onerror = () => {
        if (!resolved) {
          resolved = true;
          delete (window as any)[callbackName];
          if (script.parentNode) script.parentNode.removeChild(script);
          resolve(null);
        }
      };
      
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          delete (window as any)[callbackName];
          if (script.parentNode) script.parentNode.removeChild(script);
          resolve(null);
        }
      }, 5000);
      
      document.body.appendChild(script);
    });
  }

  private async proxyRequest(groupId: number, offset: number, count: number): Promise<any> {
    try {
      const vkUrl = `https://api.vk.com/method/wall.get?owner_id=${groupId}&offset=${offset}&count=${count}&filter=all&access_token=${this.accessToken}&v=5.199`;
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(vkUrl)}`);
      return await response.json();
    } catch {
      return null;
    }
  }

  async getPostsByHashtag(hashtag: string): Promise<VkPost[]> {
    const allPosts = await this.getPosts();
    return allPosts.filter(post => post.hashtags.includes(hashtag));
  }

  extractHashtags(text: string): string[] {
    const hashtags: string[] = [];
    const regex = /#([\wа-яё]+)/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const tag = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      hashtags.push(tag);
    }
    return hashtags;
  }
}