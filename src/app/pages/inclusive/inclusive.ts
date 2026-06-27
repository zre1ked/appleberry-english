import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VkService } from '../../services/vk.service';

@Component({
  selector: 'app-inclusive',
  standalone: false,
  templateUrl: './inclusive.html',
  styleUrl: './inclusive.scss'
})
export class Inclusive implements OnInit {
  posts: any[] = [];
  isLoading = true;
  selectedPost: any = null;
  selectedImageIndex = 0;

  constructor(private cdr: ChangeDetectorRef, private vkService: VkService) {}

  ngOnInit() { this.loadPosts(); }

  async loadPosts() {
    this.isLoading = true;
    this.posts = [];
    this.cdr.detectChanges();
    try {
      this.posts = await this.vkService.getPostsByHashtag('ОсобенныеДети');
    } catch (err) { console.error(err); }
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