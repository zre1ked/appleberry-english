import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PreloadService } from '../../services/preload.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About implements OnInit {
  achievements: any[] = [];
  isLoading = true;
  
  selectedAchievement: any = null;
  selectedImageIndex = 0;

  quotes = [
    { text: 'Образование не меняет мир. Образование меняет людей. Люди меняют мир', author: 'Паулу Фрейре' },
    { text: 'Учитель должен быть артист, художник, горячо влюблённый в своё дело', author: 'Антон Чехов' },
    { text: 'Чтобы воспитывать другого, мы должны воспитать прежде всего себя', author: 'Николай Гоголь' }
  ];

  constructor(private cdr: ChangeDetectorRef, private preloadService: PreloadService, private router: Router) {}

  ngOnInit() {
    this.showAchievements();
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd && e.urlAfterRedirects === '/about') {
        this.showAchievements();
      }
    });
  }

  showAchievements() {
    this.isLoading = true;
    const d = this.preloadService.data;
    if (!d) {
      setTimeout(() => this.showAchievements(), 200);
      return;
    }
    
    this.achievements = [...(d.diplomas || []), ...(d.gramotas || []), ...(d.nagrady || [])]
      .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
      .sort((a, b) => b.id - a.id);
    
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  getAchievementIcon(achievement: any): string {
    if (achievement.hasImage && achievement.image) return achievement.image;
    if (achievement.hashtags?.includes('Диплом')) return '🏆';
    if (achievement.hashtags?.includes('Грамота')) return '📜';
    if (achievement.hashtags?.includes('Награда')) return '🎖️';
    return '🏆';
  }

  isEmoji(achievement: any): boolean { return !achievement.hasImage || !achievement.image; }
  openAchievement(achievement: any) { this.selectedAchievement = achievement; this.selectedImageIndex = 0; document.body.style.overflow = 'hidden'; }
  closeAchievement() { this.selectedAchievement = null; document.body.style.overflow = ''; }
  nextImage() { if (this.selectedAchievement?.images?.length) { this.selectedImageIndex = (this.selectedImageIndex + 1) % this.selectedAchievement.images.length; } }
  prevImage() { if (this.selectedAchievement?.images?.length) { this.selectedImageIndex = (this.selectedImageIndex - 1 + this.selectedAchievement.images.length) % this.selectedAchievement.images.length; } }
  selectImage(index: number) { this.selectedImageIndex = index; }
}