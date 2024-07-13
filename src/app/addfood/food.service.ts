// src/app/shared/food.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Food } from '../addfood/food'; // Adjust the import path as necessary
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private servingFoodsSubject = new BehaviorSubject<Food[]>([]);
  servingFoods$ = this.servingFoodsSubject.asObservable();

  constructor(private snackBar: MatSnackBar){}

  addFoodToServing(food: Food): void {
    const currentFoods = this.servingFoodsSubject.value;
    // Check if the food already exists
    const foodExists = currentFoods.some(f => f.name.toLowerCase() === food.name.toLowerCase());
    if (!foodExists) {
      this.servingFoodsSubject.next([...currentFoods, food]);
    } else {
      console.log("Food already exists in the serving list.");
      this.snackBar.open('This food item already exists!', 'Close', {
        duration: 3000 // Duration in milliseconds (3000ms = 3 seconds)
      });
    }
  }

  removeFoodFromServing(food: Food): void {
    const currentFoods = this.servingFoodsSubject.value.filter(f => f !== food);
    this.servingFoodsSubject.next(currentFoods);
  }

  clearServingFoods(): void {
    this.servingFoodsSubject.next([]);
  }
}
