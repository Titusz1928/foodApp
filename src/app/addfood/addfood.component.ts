import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Food } from './food';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FoodService } from './food.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'flapp-addfood',
  templateUrl: './addfood.component.html',
  styleUrls: ['./addfood.component.scss']
})
export class AddfoodComponent implements OnInit {
  displayedColumns: string[] = ['name', 'total_consumptions', 'last_consumption'];
  dataSource = new MatTableDataSource<Food>([]);
  addNewFoodForm!: FormGroup;
  newFood: string = '';
  allFoods: Food[] = [];
  filteredFoods: Food[] = [];
  sortByOption: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private formBuilder: FormBuilder,
    private router: Router,
    private foodService: FoodService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadFoods();
    this.addNewFoodForm = this.formBuilder.group({
      food: ['', [Validators.required]],
    });
  }

  async loadFoods() {
    try {
      const foods = await this.supabaseService.getFoods();
      console.log('Component foods:', foods);  // Verify if the data is being fetched
  
      // Sorting foods by last_consumption date in descending order
      foods.sort((a: Food, b: Food) => new Date(b.last_consumption).getTime() - new Date(a.last_consumption).getTime());
  
      this.allFoods = foods;
      this.dataSource.data = this.allFoods;
      this.filteredFoods = foods; // Initialize filteredFoods with all foods
    } catch (error) {
      console.error('Error loading foods:', error);
    }
  }
  
  onFoodInputChange(value: string): void {
    this.newFood = this.capitalizeFirstLetter(value.toLowerCase());
    this.filterFoods();
  }

  private capitalizeFirstLetter(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private filterFoods(): void {
    this.filteredFoods = this.allFoods.filter(food =>
      food.name.toLowerCase().startsWith(this.newFood.toLowerCase())
    );
  }

  addToTable(): void {
    const confirmed = window.confirm('Are you sure you want to add this new food type?');

    if (confirmed) {
      console.log("Adding to table:", this.newFood);
  
      // Verify if the food already exists in the array
      const foodExists = this.allFoods.some(food => food.name.toLowerCase() === this.newFood.toLowerCase());
  
      if (foodExists) {
        console.log("Food already exists in the table.");
        this.snackBar.open('This food item already exists!', 'Close', {
          duration: 3000 // Duration in milliseconds (3000ms = 3 seconds)
        });
        // Optionally, display a message to the user or handle it in your preferred way
        return;
      }
  
      // Create a new food item object without the ID
      const newFoodItem: Food = { 
        name: this.newFood, 
        total_consumptions: 0,
        last_consumption: new Date() 
      };
  
      // Call Supabase service method to add the new food item to the database
      this.supabaseService.createFood(newFoodItem)
        .then((response) => {
          console.log("response returned!");
          if (response) {
            console.log('New food item added to Supabase:', response);
  
            this.allFoods.push(response);
            this.dataSource.data = [...this.allFoods];
  
          } else {
            console.error('Unexpected response from createFood method.');
          }
        })
        .catch((error) => {
          console.error('Error adding new food item to Supabase:', error);
          // Display specific error messages or handle the error appropriately
        });
    }
  }

  onRowClick(food: Food): void {
    this.foodService.addFoodToServing(food);
    this.router.navigate(['/foods/serving']);
    // Perform any desired action, e.g., navigate to a detail view, open a modal, etc.
  }

  sortFoods(): void {
    if (this.sortByOption === 'option0') {
      // Sort by last consumption date, newest first
      this.allFoods.sort((a, b) => new Date(b.last_consumption).getTime() - new Date(a.last_consumption).getTime());
    } else if (this.sortByOption === 'option1') {
      // Sort by name
      this.allFoods.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortByOption === 'option2') {
      // Sort by oldest first
      this.allFoods.sort((a, b) => new Date(a.last_consumption).getTime() - new Date(b.last_consumption).getTime());
    }
  
    // Update the dataSource to reflect the sorted data
    this.dataSource.data = [...this.allFoods]; // Trigger change detection by creating a new array
  }
}
