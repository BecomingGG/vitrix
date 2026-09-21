import { Routes } from '@angular/router';

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
    loadComponent: () => import('./pages/apply/apply').then((m) => m.Apply),
  },
  { path: '**', redirectTo: '' },
];
