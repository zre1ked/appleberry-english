import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VkService } from '../../services/vk.service';

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class Blog implements OnInit {
  blogPosts: any[] = [];
  colleaguesPosts: any[] = [];
  parentsPosts: any[] = [];
  studentsPosts: any[] = [];
  inclusivePosts: any[] = [];
  newsPosts: any[] = [];
  
  isLoading = true;
  activeTab: 'blog' | 'colleagues' | 'parents' | 'students' | 'inclusive' | 'news' = 'blog';
  
  selectedPost: any = null;
  selectedImageIndex = 0;

  tabs = [
    { id: 'blog' as const, label: 'Блог', hashtag: 'Блог', icon: '📝' },
    { id: 'colleagues' as const, label: 'Коллегам', hashtag: 'Коллегам', icon: '👥' },
    { id: 'parents' as const, label: 'Родителям', hashtag: 'Родителям', icon: '👨‍👩‍👧‍👦' },
    { id: 'students' as const, label: 'Ученикам', hashtag: 'Ученикам', icon: '🎓' },
    { id: 'inclusive' as const, label: 'Особенные дети', hashtag: 'ОсобенныеДети', icon: '💙' },
    { id: 'news' as const, label: 'Новости', hashtag: '', icon: '📰' }
  ];

  constructor(private cdr: ChangeDetectorRef, private vkService: VkService) {}

  ngOnInit() {
    this.loadAllPosts();
  }

  async loadAllPosts() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    try {
      const allPosts = await this.vkService.getAllPosts();
      
      console.log('=== ALL POSTS FROM VK ===');
      console.log('Total:', allPosts.length);
      
      const blogPosts = allPosts.filter(p => p.hashtags.includes('Блог'));
      console.log('Blog posts:', blogPosts.length);
      
      blogPosts.forEach((p, i) => {
        console.log(`Blog post ${i}:`, {
          id: p.id,
          text: p.text?.substring(0, 50),
          hashtags: p.hashtags,
          hasImage: p.hasImage,
          hasFiles: p.hasFiles
        });
      });
      
      this.blogPosts = blogPosts;
      this.colleaguesPosts = allPosts.filter(p => p.hashtags.includes('Коллегам'));
      this.parentsPosts = allPosts.filter(p => p.hashtags.includes('Родителям'));
      this.studentsPosts = allPosts.filter(p => p.hashtags.includes('Ученикам'));
      this.inclusivePosts = allPosts.filter(p => p.hashtags.includes('ОсобенныеДети'));
      this.newsPosts = await this.loadNews();
    } catch (err) {
      console.error('Error loading posts:', err);
    }
    
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  async loadNews(): Promise<any[]> {
    console.log('Loading news...');
    
    try {
      const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://admsurgut.ru/novosti/');
      const response = await fetch(proxyUrl);
      const html = await response.text();
      
      console.log('HTML loaded, length:', html.length);
      
      const posts: any[] = [];
      
      const allLinksRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]{15,})<\/a>/gi;
      let match;
      
      while ((match = allLinksRegex.exec(html)) !== null) {
        const href = match[1];
        const text = match[2].trim();
        
        if (text.length > 20 && !text.includes('window') && !text.includes('function')) {
          const fullUrl = href.startsWith('http') ? href : 'https://admsurgut.ru' + href;
          
          if (!posts.find(p => p.url === fullUrl)) {
            posts.push({
              id: Math.random(),
              text: '',
              shortText: text,
              date: '',
              image: '',
              images: [],
              hasImage: false,
              hasVideos: false,
              url: fullUrl,
              isLong: false,
              hashtags: []
            });
          }
        }
        
        if (posts.length >= 6) break;
      }
      
      console.log('Parsed posts:', posts.length);
      if (posts.length > 0) return posts;
    } catch (e) {
      console.log('Error:', e);
    }

    return [{
      id: 1,
      text: '',
      shortText: 'Новости администрации Сургута — перейти на сайт',
      date: '',
      image: '',
      images: [],
      hasImage: false,
      hasVideos: false,
      url: 'https://admsurgut.ru/novosti/',
      isLong: false,
      hashtags: []
    }];
  }

  get currentPosts() {
    switch (this.activeTab) {
      case 'blog': return this.blogPosts;
      case 'colleagues': return this.colleaguesPosts;
      case 'parents': return this.parentsPosts;
      case 'students': return this.studentsPosts;
      case 'inclusive': return this.inclusivePosts;
      case 'news': return this.newsPosts;
      default: return [];
    }
  }

  setTab(tab: 'blog' | 'colleagues' | 'parents' | 'students' | 'inclusive' | 'news') {
    this.activeTab = tab;
  }

  openPost(post: any) {
    this.selectedPost = post;
    this.selectedImageIndex = 0;
    document.body.style.overflow = 'hidden';
  }

  closePost() {
    this.selectedPost = null;
    document.body.style.overflow = '';
  }

  nextImage() {
    if (this.selectedPost?.images?.length) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.selectedPost.images.length;
    }
  }

  prevImage() {
    if (this.selectedPost?.images?.length) {
      this.selectedImageIndex = (this.selectedImageIndex - 1 + this.selectedPost.images.length) % this.selectedPost.images.length;
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }
}