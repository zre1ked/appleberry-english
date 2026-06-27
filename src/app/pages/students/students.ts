import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VkService } from '../../services/vk.service';

@Component({
  selector: 'app-students',
  standalone: false,
  templateUrl: './students.html',
  styleUrl: './students.scss'
})
export class Students implements OnInit {
  posts: any[] = [];
  isLoading = true;
  error = '';
  
  selectedPost: any = null;
  selectedImageIndex = 0;

  constructor(private cdr: ChangeDetectorRef, private vkService: VkService) {}

  ngOnInit() {
    this.loadPosts();
  }

  async loadPosts() {
    this.isLoading = true;
    this.error = '';
    this.posts = [];
    this.cdr.detectChanges();
    
    try {
      this.posts = await this.vkService.getPostsByHashtag('Ученикам');
    } catch (err) {
      this.error = 'Ошибка загрузки';
      console.error(err);
    }
    
    this.isLoading = false;
    this.cdr.detectChanges();
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