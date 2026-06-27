import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VkService } from '../../services/vk.service';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About implements OnInit {
  achievements: any[] = [];
  isLoadingAchievements = true;
  
  selectedAchievement: any = null;
  selectedImageIndex = 0;

  quotes = [
    { text: 'Образование не меняет мир. Образование меняет людей. Люди меняют мир', author: 'Паулу Фрейре' },
    { text: 'Учитель должен быть артист, художник, горячо влюблённый в своё дело', author: 'Антон Чехов' },
    { text: 'Чтобы воспитывать другого, мы должны воспитать прежде всего себя', author: 'Николай Гоголь' }
  ];

  constructor(private cdr: ChangeDetectorRef, private vkService: VkService) {}

  ngOnInit() {
    this.loadAchievements();
  }

  async loadAchievements() {
    this.isLoadingAchievements = true;
    this.cdr.detectChanges();
    
    try {
      const diplomas = await this.vkService.getPostsByHashtag('Диплом');
      const gramotas = await this.vkService.getPostsByHashtag('Грамота');
      const nagrady = await this.vkService.getPostsByHashtag('Награда');
      
      this.achievements = [...diplomas, ...gramotas, ...nagrady];
      
      this.achievements = this.achievements.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      );
      
      this.achievements.sort((a, b) => b.id - a.id);
      
    } catch (err) {
      console.error('Error loading achievements:', err);
    }
    
    this.isLoadingAchievements = false;
    this.cdr.detectChanges();
  }

  getAchievementIcon(achievement: any): string {
    if (achievement.hasImage && achievement.image) {
      return achievement.image;
    }
    if (achievement.hashtags.includes('Диплом')) return '🏆';
    if (achievement.hashtags.includes('Грамота')) return '📜';
    if (achievement.hashtags.includes('Награда')) return '🎖️';
    return '🏆';
  }

  isEmoji(achievement: any): boolean {
    return !achievement.hasImage || !achievement.image;
  }

  openAchievement(achievement: any) {
    this.selectedAchievement = achievement;
    this.selectedImageIndex = 0;
    document.body.style.overflow = 'hidden';
  }

  closeAchievement() {
    this.selectedAchievement = null;
    document.body.style.overflow = '';
  }

  nextImage() {
    if (this.selectedAchievement?.images?.length) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.selectedAchievement.images.length;
    }
  }

  prevImage() {
    if (this.selectedAchievement?.images?.length) {
      this.selectedImageIndex = (this.selectedImageIndex - 1 + this.selectedAchievement.images.length) % this.selectedAchievement.images.length;
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }
}