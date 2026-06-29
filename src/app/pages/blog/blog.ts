import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PreloadService } from '../../services/preload.service';
import { Router, NavigationEnd } from '@angular/router';

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
    { id: 'blog' as const, label: 'Блог', icon: '📝' },
    { id: 'colleagues' as const, label: 'Коллегам', icon: '👥' },
    { id: 'parents' as const, label: 'Родителям', icon: '👨‍👩‍👧‍👦' },
    { id: 'students' as const, label: 'Ученикам', icon: '🎓' },
    { id: 'inclusive' as const, label: 'Особенные дети', icon: '💙' },
    { id: 'news' as const, label: 'Новости', icon: '📰' }
  ];

  constructor(private cdr: ChangeDetectorRef, private preloadService: PreloadService, private router: Router) {}

  ngOnInit() {
    this.showAllPosts();
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd && e.urlAfterRedirects === '/blog') {
        this.showAllPosts();
      }
    });
  }

  showAllPosts() {
    this.isLoading = true;
    const d = this.preloadService.data;
    if (!d) {
      setTimeout(() => this.showAllPosts(), 200);
      return;
    }
    
    this.blogPosts = d.blog || [];
    this.colleaguesPosts = d.colleagues || [];
    this.parentsPosts = d.parents || [];
    this.studentsPosts = d.students || [];
    this.inclusivePosts = d.inclusive || [];
    this.newsPosts = d.news || [];
    this.isLoading = false;
    this.cdr.detectChanges();
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

  openPost(post: any) { this.selectedPost = post; this.selectedImageIndex = 0; document.body.style.overflow = 'hidden'; }
  closePost() { this.selectedPost = null; document.body.style.overflow = ''; }
  nextImage() { if (this.selectedPost?.images?.length) { this.selectedImageIndex = (this.selectedImageIndex + 1) % this.selectedPost.images.length; } }
  prevImage() { if (this.selectedPost?.images?.length) { this.selectedImageIndex = (this.selectedImageIndex - 1 + this.selectedPost.images.length) % this.selectedPost.images.length; } }
  selectImage(index: number) { this.selectedImageIndex = index; }
}