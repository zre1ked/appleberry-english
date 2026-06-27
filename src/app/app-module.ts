import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Gallery } from './pages/gallery/gallery';
import { Blog } from './pages/blog/blog';
import { Contacts } from './pages/contacts/contacts';
import { Colleagues } from './pages/colleagues/colleagues';
import { Parents } from './pages/parents/parents';
import { Students } from './pages/students/students';
import { Inclusive } from './pages/inclusive/inclusive';
import { SafeUrlPipe } from './pipes/safe-url.pipe';

@NgModule({
  declarations: [App, Header, Footer, Home, About, Gallery, Blog, Contacts, Colleagues, Parents, Students, Inclusive, SafeUrlPipe],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [App],
})
export class AppModule {}