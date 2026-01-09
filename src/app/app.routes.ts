import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountOpeningComponent } from './components/account-opening/account-opening.component';
import { SubmissionsComponent } from './components/submissions/submissions.component';
import { PresentationsComponent } from './components/presentations/presentations.component';

/**
 * Application routes configuration
 */
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'account-opening',
        component: AccountOpeningComponent
      },
      {
        path: 'submissions',
        component: SubmissionsComponent
      },
      {
        path: 'presentations',
        component: PresentationsComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
