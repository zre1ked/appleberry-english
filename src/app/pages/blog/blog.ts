import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VkService } from '../../services/vk.service';

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class Blog implements OnInit {
  private allBlogPosts: any[] = [];
  private allColleaguesPosts: any[] = [];
  private allParentsPosts: any[] = [];
  private allStudentsPosts: any[] = [];
  private allInclusivePosts: any[] = [];
  private allNewsPosts: any[] = [];
  
  blogPosts: any[] = [];
  colleaguesPosts: any[] = [];
  parentsPosts: any[] = [];
  studentsPosts: any[] = [];
  inclusivePosts: any[] = [];
  newsPosts: any[] = [];
  
  isLoading = true;
  activeTab: 'blog' | 'colleagues' | 'parents' | 'students' | 'inclusive' | 'news' = 'blog';
  
  private pageSize = 6;
  private loadingMore = false;
  
  selectedPost: any = null;
  selectedImageIndex = 0;

  tabs = [
    { id: 'blog' as const, label: 'Блог', icon: '📝' },
    { id: 'colleagues' as const, label: 'Коллегам', icon: '👥' },
    { id: 'parents' as const, label: 'Родителям', icon: '👨‍👩‍👧‍👦' },
    { id: 'students' as const, label: 'Ученикам', icon: '🎓' },
    { id: 'inclusive' as const, label: 'Особенные дети', icon: '💙' },
    { id: 'news' as const, label: 'Новости', icon: '📰' }
  ];

  constructor(private cdr: ChangeDetectorRef, private vkService: VkService) {}

  ngOnInit() {
    this.loadAllPosts();
  }

  async loadAllPosts() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    try {
      const [blog, colleagues, parents, students, inclusive, news] = await Promise.all([
        this.vkService.getPostsByHashtag('Блог'),
        this.vkService.getPostsByHashtag('Коллегам'),
        this.vkService.getPostsByHashtag('Родителям'),
        this.vkService.getPostsByHashtag('Ученикам'),
        this.vkService.getPostsByHashtag('ОсобенныеДети'),
        this.loadNews()
      ]);
      
      this.allBlogPosts = blog;
      this.allColleaguesPosts = colleagues;
      this.allParentsPosts = parents;
      this.allStudentsPosts = students;
      this.allInclusivePosts = inclusive;
      this.allNewsPosts = news;
      
      this.blogPosts = blog.slice(0, this.pageSize);
      this.colleaguesPosts = colleagues.slice(0, this.pageSize);
      this.parentsPosts = parents.slice(0, this.pageSize);
      this.studentsPosts = students.slice(0, this.pageSize);
      this.inclusivePosts = inclusive.slice(0, this.pageSize);
      this.newsPosts = news.slice(0, this.pageSize);
      
    } catch (err) {
      console.error('Error loading posts:', err);
    }
    
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  async loadNews(): Promise<any[]> {
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
    } catch (e) { return []; }
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
    this.loadMoreIfNeeded(tab);
  }

  private loadMoreIfNeeded(tab: string) {
    const all = this.getAllPosts(tab);
    const displayed = this.getDisplayedPosts(tab);
    
    if (displayed.length < all.length && !this.loadingMore) {
      this.loadingMore = true;
      setTimeout(() => {
        const next = all.slice(displayed.length, displayed.length + this.pageSize);
        switch (tab) {
          case 'blog': this.blogPosts = [...displayed, ...next]; break;
          case 'colleagues': this.colleaguesPosts = [...displayed, ...next]; break;
          case 'parents': this.parentsPosts = [...displayed, ...next]; break;
          case 'students': this.studentsPosts = [...displayed, ...next]; break;
          case 'inclusive': this.inclusivePosts = [...displayed, ...next]; break;
          case 'news': this.newsPosts = [...displayed, ...next]; break;
        }
        this.loadingMore = false;
        this.cdr.detectChanges();
      }, 100);
    }
  }

  private getAllPosts(tab: string): any[] {
    switch (tab) {
      case 'blog': return this.allBlogPosts;
      case 'colleagues': return this.allColleaguesPosts;
      case 'parents': return this.allParentsPosts;
      case 'students': return this.allStudentsPosts;
      case 'inclusive': return this.allInclusivePosts;
      case 'news': return this.allNewsPosts;
      default: return [];
    }
  }

  private getDisplayedPosts(tab: string): any[] {
    switch (tab) {
      case 'blog': return this.blogPosts;
      case 'colleagues': return this.colleaguesPosts;
      case 'parents': return this.parentsPosts;
      case 'students': return this.studentsPosts;
      case 'inclusive': return this.inclusivePosts;
      case 'news': return this.newsPosts;
      default: return [];
    }
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