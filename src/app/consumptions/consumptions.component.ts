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
  currentOffset: number = 0; // To keep track of the offset for pagination
  loadingMore: boolean = false; // Flag to prevent multiple loads

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    const today = new Date();
    this.dateForm = this.fb.group({
      daySelector: new FormControl(today, { validators: [Validators.required] })
    });

    // Subscribe to date changes
    this.dateForm.get('daySelector')?.valueChanges.subscribe((selectedDate) => {
      this.filterPlatesByDate(selectedDate);
    });

    // Load plates and apply filtering based on initial date
    this.loadPlates().then(() => {
      this.filterPlatesByDate(this.dateForm.get('daySelector')?.value);
    });
  }

  async loadPlates() {
    if (this.loadingMore) return; // Prevent loading if already loading

    this.loadingMore = true;
    try {
      const plates = await this.supabaseService.getPlates(this.rowsToShow, this.currentOffset);
      
      if (plates.length > 0) {
        // Fetch food names for each plate
        for (let plate of plates) {
          const foodIds = JSON.parse(plate.foods);
          const foodNames = await Promise.all(foodIds.map((id: number) => this.supabaseService.getFoodNameById(id)));
          plate.foodsArray = foodNames; // Use a new property to store the array of food names
        }

        // Append plates to the existing list
        this.plates = [...this.plates, ...plates];

        // Sort plates by date (newest first)
        this.plates.sort((a, b) => new Date(b.served_at).getTime() - new Date(a.served_at).getTime());
      } else {
        this.snackBar.open('No more plates are available!', 'Close', {
          duration: 3000 // Duration in milliseconds (3000ms = 3 seconds)
        });
      }
    } catch (error) {
      console.error('Error loading plates:', error);
    } finally {
      this.loadingMore = false;
    }
  }

  filterPlatesByDate(selectedDate: Date) {
    this.filteredPlates = this.plates.filter(plate => {
      const plateDate = new Date(plate.served_at);
      return plateDate.toDateString() === selectedDate.toDateString();
    });
  }

  loadMoreRows() {
    this.currentOffset += this.rowsToShow; // Update offset
    this.rowsToShow += 5; // Increase rows to show
    this.loadPlates().then(() => {
      this.filterPlatesByDate(this.dateForm.get('daySelector')?.value);
    });
  }
}
