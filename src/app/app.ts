import { Component, OnInit } from '@angular/core';
import { PreloadService } from './services/preload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'teacher-site-angular';

  constructor(private preloadService: PreloadService) {}

  ngOnInit() {
    // Запускаем предзагрузку при старте приложения
    this.preloadService.preload();
  }
}