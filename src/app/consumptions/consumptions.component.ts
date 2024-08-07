import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'flapp-consumptions',
  templateUrl: './consumptions.component.html',
  styleUrls: ['./consumptions.component.scss']
})
export class ConsumptionsComponent implements OnInit {

  plates: any[] = [];
  displayedColumns: string[] = ['foods', 'served_at'];
  dateForm!: FormGroup;
  filteredPlates: any[] = [];
  rowsToShow: number = 5;

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.loadPlates();

    const today = new Date();
    this.dateForm = this.fb.group({
      daySelector: new FormControl(today, { validators: [Validators.required] })
    });

    this.dateForm.get('daySelector')?.valueChanges.subscribe((selectedDate) => {
      this.filterPlatesByDate(selectedDate);
    });
  }

  async loadPlates() {
    try {
      const plates = await this.supabaseService.getPlates();
      for (let plate of plates) {
        const foodIds = JSON.parse(plate.foods);
        const foodNames = await Promise.all(foodIds.map((id: number) => this.supabaseService.getFoodNameById(id)));
        plate.foodsArray = foodNames; // Use a new property to store the array of food names
      }
  
      // Sort plates by date (newest first)
      plates.sort((a, b) => new Date(b.served_at).getTime() - new Date(a.served_at).getTime());
  
      this.plates = plates;
      // Initial filter to display today's plates
      this.filterPlatesByDate(this.dateForm.get('daySelector')?.value);
    } catch (error) {
      console.error('Error loading plates:', error);
    }
  }
  

  filterPlatesByDate(selectedDate: Date) {
    this.filteredPlates = this.plates.filter(plate => {
      const plateDate = new Date(plate.served_at);
      return plateDate.toDateString() === selectedDate.toDateString();
    });
  }

  loadMoreRows() {
    this.rowsToShow += 5;  // Increase the number of rows to show by 2
    if(this.rowsToShow>=this.plates.length){
      this.snackBar.open('No more plates are available!', 'Close', {
        duration: 3000 // Duration in milliseconds (3000ms = 3 seconds)
      });
    }
  }

}
