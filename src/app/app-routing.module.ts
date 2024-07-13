import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddfoodComponent } from './addfood/addfood.component';
import { ConsumptionsComponent } from './consumptions/consumptions.component';
import { ServingComponent } from './addfood/serving/serving.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { CreditsComponent } from './credits/credits.component';
import { NotfoundComponent } from './notfound/notfound.component';

const routes: Routes = [
  {path:'login',component:LoginComponent},
  {
    path:'foods',
    component:AddfoodComponent,
    children:[{path:'serving',component:ServingComponent}],
    canActivate: [AuthGuard],
  },
  { 
    path:'consumptions',
    component:ConsumptionsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path:'home',
    component:HomeComponent,
    canActivate: [AuthGuard]
  },
  { 
    path:'credits',
    component:CreditsComponent,
    canActivate: [AuthGuard]
  },
  {path: '',
   redirectTo: '/login',
   pathMatch:'full',
  },
  {path:'**',component:NotfoundComponent,canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
