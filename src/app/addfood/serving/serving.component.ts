// src/app/addfood/serving/serving.component.ts
import { Component, OnInit } from '@angular/core';
import { Food } from '../food'; // Adjust the import path as necessary
import { FoodService } from '../food.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-serving',
  templateUrl: './serving.component.html',
  styleUrls: ['./serving.component.scss']
})
export class ServingComponent implements OnInit {
  servingFoods: Food[] = [];


  constructor(
    private foodService: FoodService,
    private snackBar: MatSnackBar,
    private supabaseService: SupabaseService,
    private router:Router,
  ) { }

  ngOnInit(): void {
    this.foodService.servingFoods$.subscribe(foods => {
      this.servingFoods = foods;
    });
  }

  remove(food: Food): void {
    this.foodService.removeFoodFromServing(food);
  }

  async savePlate(): Promise<void> {
    console.log("saving plate...");
    const foodIdsArray = await Promise.all(
      this.servingFoods.map(async (food) => {
        const foodId = await this.supabaseService.getFoodIdByName(food.name);
        return foodId !== -1 ? foodId : null;
      })
    );

    const filteredFoodIds = foodIdsArray.filter(id => id !== null) as number[];
    const jsonString = JSON.stringify(filteredFoodIds);
    console.log(jsonString);

    try {
      await this.supabaseService.createPlate(jsonString, new Date());
      console.log('Plate saved successfully');
      // this.snackBar.open('Plate saved successfully!', 'Close', {
      //   duration: 3000 // Duration in milliseconds (3000ms = 3 seconds)
      // });
      this.router.navigate(['/consumptions']);
    } catch (error) {
      console.error('Error saving plate:', error);
      this.snackBar.open('Error saving plate!', 'Close', {
        duration: 3000
      });
    }

    // Clear the serving foods array
    this.foodService.clearServingFoods();
  }
}
