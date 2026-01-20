import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { HotelLayoutComponent } from './components/hotel-layout/hotel-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountOpeningComponent } from './components/account-opening/account-opening.component';
import { SubmissionsComponent } from './components/submissions/submissions.component';
import { PresentationsComponent } from './components/presentations/presentations.component';
import { HotelCheckinComponent } from './components/hotel-checkin/hotel-checkin.component';
import { HotelCheckoutComponent } from './components/hotel-checkout/hotel-checkout.component';
import { HotelDashboardComponent } from './components/hotel-dashboard/hotel-dashboard.component';
import { AuthWrapperComponent } from './components/auth/auth-wrapper.component';
import { authGuard, guestGuard } from './guards/auth.guard';

/**
 * Application routes configuration
 * Separate routes for Bank and Hotel use cases
 */
export const routes: Routes = [
  // Auth routes (public, redirects if already authenticated)
  {
    path: 'login',
    component: AuthWrapperComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    redirectTo: '/login?mode=register',
    pathMatch: 'full'
  },
  // Bank routes (protected)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
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
  // Hotel routes (protected)
  {
    path: 'hotel',
    component: HotelLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: HotelDashboardComponent
      },
      {
        path: 'checkin',
        component: HotelCheckinComponent
      },
      {
        path: 'checkout',
        component: HotelCheckoutComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
