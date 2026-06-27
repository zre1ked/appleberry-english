import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Gallery } from './pages/gallery/gallery';
import { Blog } from './pages/blog/blog';
import { Contacts } from './pages/contacts/contacts';
import { Colleagues } from './pages/colleagues/colleagues';
import { Parents } from './pages/parents/parents';
import { Students } from './pages/students/students';
import { Inclusive } from './pages/inclusive/inclusive';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'gallery', component: Gallery },
  { path: 'blog', component: Blog },
  { path: 'colleagues', component: Colleagues },
  { path: 'parents', component: Parents },
  { path: 'students', component: Students },
  { path: 'inclusive', component: Inclusive },
  { path: 'contacts', component: Contacts },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }