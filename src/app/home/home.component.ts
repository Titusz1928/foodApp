import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Info } from './info';
import { Food } from '../addfood/food';

@Component({
  selector: 'flapp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) { }

  todayPlateExists: boolean = false;
  no_plate_message: string = "";
  yes_plate_message:string="";
  currentDate: Date = new Date();
  public infoList:Info[]=[];
  allFoods: Food[] = [];
  public foodScores: { foodName: string, score: number }[] = [];

  ngOnInit(): void {
    this.no_plate_message = "Go and create plate!";
    this.yes_plate_message="Plate already created for today";
    this.checkIfTodayPlateExists();
    this.infoList=[
      {
        title: "Oldest made",
        description:"The foods that havent been made for a long time",
        foods:[],
        image: "assets/infos/old.png",
      },
      {
        title: "Your favourite",
        description:"These foods have been made a lot of times",
        foods:[],
        image: "assets/infos/fav.png",
      },
      {
        title: "Wasnt made in a while",
        description:"These foods are commonly made but werent made in the past few weeks",
        foods:[],
        image: "assets/infos/idea.png",
      }
    ];
    this.fetchOldestFoods();
    this.fetchFavouriteFoods();
    this.loadFoods();
  }

  
  async loadFoods() {
    try {
      const foods = await this.supabaseService.getFoods();
      console.log('Component foods:', foods);  // Verify if the data is being fetched
  
      // Ensure last_consumption is parsed as Date
      this.allFoods = foods.map(food => ({
        ...food,
        last_consumption: new Date(food.last_consumption) // Parse string to Date
      }));
  
      this.calculateScores();
    } catch (error) {
      console.error('Error loading foods:', error);
    }
  }


  async checkIfTodayPlateExists() {
    try {
      const lastPlateDate = await this.supabaseService.getLastPlateDate();
      if (lastPlateDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set today's time to midnight
        const lastPlateDateOnly = new Date(lastPlateDate);
        lastPlateDateOnly.setHours(0, 0, 0, 0); // Set last plate's time to midnight
        this.todayPlateExists = today.getTime() === lastPlateDateOnly.getTime();
        console.log(this.todayPlateExists);
      }
    } catch (error) {
      console.error('Error checking if today\'s plate exists:', error);
    }
  }

  async fetchOldestFoods() {
    try {
      const oldestFoods = await this.supabaseService.getOldestFoods(5); // Fetch 3 oldest foods
      if (oldestFoods.length > 0) {
        // Populate the first item in infoList with oldest foods
        console.log(oldestFoods);
        this.infoList[0].foods = oldestFoods.map(food => food.name);
      }
    } catch (error) {
      console.error('Error populating infoList with oldest foods:', error);
    }
  }

  async fetchFavouriteFoods() {
    try {
      const favouriteFoods = await this.supabaseService.getTopConsumptionFoods(5); // Fetch 3 oldest foods
      if (favouriteFoods.length > 0) {
        // Populate the first item in infoList with oldest foods
        console.log(favouriteFoods);
        this.infoList[1].foods = favouriteFoods.map(food => food.name);
      }
    } catch (error) {
      console.error('Error populating infoList with favourite foods:', error);
    }
  }

  goToFoods() {
    console.log("going to /foods");
    this.router.navigate(['/foods/serving']);
  }


  calculateScores() {
    this.allFoods.forEach(food => {
      const score = this.calculateScore(food);
      this.foodScores.push({ foodName: food.name, score: score });
    });

    // Sort foodScores array based on score in descending order
    this.foodScores.sort((a, b) => b.score - a.score);
    console.log("foodScores:",this.foodScores);

    // Take top 3 foods by score
    const topScoredFoods = this.foodScores.slice(0, 5);

    // Map top scored foods to infoList[2].foods
    console.log(topScoredFoods);
    this.infoList[2].foods = topScoredFoods.map(food => food.foodName);
  }

  calculateScore(food: Food): number {
    const daysSinceLastConsumption = this.calculateDaysSinceLastConsumption(food.last_consumption);
    return food.total_consumptions + (2 * daysSinceLastConsumption);
  }

  calculateDaysSinceLastConsumption(lastConsumptionDate: Date): number {
    const lastConsumption = lastConsumptionDate.getTime();
    const now = new Date().getTime();
    const diffTime = now - lastConsumption;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return diffDays;
  }


  
}
