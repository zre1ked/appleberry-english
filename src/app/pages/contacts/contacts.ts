import { Component } from '@angular/core';

interface UsefulLink {
  id: number;
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-contacts',
  standalone: false,
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss'
})
export class Contacts {
  links: UsefulLink[] = [
    { id: 1, title: 'Институт развития образования ХМАО-Югры', url: 'https://iro86.ru/', icon: '🎓' },
    { id: 2, title: 'СурВики - Сургутский вики-портал', url: 'https://surwiki.admsurgut.ru/wiki/index.php?title=%D0%97%D0%B0%D0%B3%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F_%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0', icon: '📚' },
    { id: 3, title: 'Перспектива - портал госуслуг', url: 'https://perspektiva-surgut.gosuslugi.ru', icon: '🏫' },
  ];
}