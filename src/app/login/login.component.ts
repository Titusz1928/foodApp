import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'flapp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  password: string = '';
  readonly correctPassword: string = 'CHANGETHIS';

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Check if the user is already authenticated
    if (localStorage.getItem('isAuthenticated') === 'true') {
      this.router.navigate(['/home']);
    }
  }

  onSubmit(): void {
    if (this.password === this.correctPassword) {
      localStorage.setItem('isAuthenticated', 'true');
      this.router.navigate(['/home']);
    } else {
      alert('Incorrect password');
    }
  }
}
