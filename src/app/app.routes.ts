import { Routes } from '@angular/router';
import { authGuard } from './auth';

export const routes: Routes = [
  {
    path: '',
    data: { title: 'Home' },
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'about',
    data: { title: 'About' },
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'courses',
    data: { title: 'Courses' },
    loadComponent: () => import('./pages/courses/courses').then((m) => m.Courses),
  },
  {
    path: 'simulation',
    data: { title: 'Simulation' },
    loadComponent: () => import('./pages/simulation/simulation').then((m) => m.Simulation),
  },
  {
    path: 'faculty',
    data: { title: 'Faculty' },
    loadComponent: () => import('./pages/faculty/faculty').then((m) => m.Faculty),
  },
  {
    path: 'partners',
    data: { title: 'Partners' },
    loadComponent: () => import('./pages/partners/partners').then((m) => m.Partners),
  },
  {
    path: 'contact',
    data: { title: 'Contact' },
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'apply',
    data: { title: 'Apply' },
    canActivate: [authGuard],
    loadComponent: () => import('./pages/apply/apply').then((m) => m.Apply),
  },
  {
    path: 'login',
    data: { title: 'Log in' },
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'account',
    data: { title: 'My account' },
    canActivate: [authGuard],
    loadComponent: () => import('./pages/account/account').then((m) => m.Account),
  },
  {
    path: 'callback',
    data: { title: 'Signing in' },
    loadComponent: () => import('./pages/callback/callback').then((m) => m.Callback),
  },
  { path: '**', redirectTo: '' },
];
