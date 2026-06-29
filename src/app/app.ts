import { Component, OnInit } from '@angular/core';
import { PreloadService } from './services/preload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  constructor(private preloadService: PreloadService) {}

  ngOnInit() {
    this.preloadService.load();
  }
}