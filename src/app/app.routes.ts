import { Routes } from '@angular/router';
import {UploadComponent} from './pages/upload/upload.component';
import {Upload2Component} from './pages/upload2/upload2.component';


export const routes: Routes = [
  { path: '', component: UploadComponent }, // Default route
  { path: 'u2', component: Upload2Component },
];
