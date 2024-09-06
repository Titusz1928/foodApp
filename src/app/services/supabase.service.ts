import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Food } from '../addfood/food';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private itemReturend:boolean=false;

  constructor() {
    this.supabase = createClient('', '');
  }


  async getFoodIdByName(foodName: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('Foods')
        .select('food_id')
        .eq('name', foodName)
        .single();

      if (error) {
        console.error('Error fetching food ID:', error);
        throw new Error(error.message);
      }

      if (data) {
        return data.food_id;
      }

      return -1; // Food not found
    } catch (error) {
      console.error('Error fetching food ID:', error);
      throw new Error('Failed to fetch food ID.');
    }
  }


  async getFoods() {
    const { data, error } = await this.supabase
      .from('Foods')
      .select('*');
    if (error) {
      console.error('Error fetching foods:', error);
      throw new Error(error.message);
    }
    console.log('Fetched foods:', data);  // Log the fetched data
    return data;
  }

  async getNotBlockedFoods() {
    const { data, error } = await this.supabase
      .from('Foods')
      .select('*')
      .or('blocked.is.false,blocked.is.null');
    if (error) {
      console.error('Error fetching foods:', error);
      throw new Error(error.message);
    }
    console.log('Fetched foods:', data);  // Log the fetched data
    return data;
  }

  async createFood(food: Food): Promise<Food | null> {
    try {
      const { data, error } = await this.supabase
        .from('Foods')
        .insert([food]);
      
      if (error) {
        console.error('Error inserting food:', error);
        throw new Error(error.message);
      }
      
      if (data) {
        const insertedFood: Food = data[0]; // Assuming Supabase returns the inserted food item
        console.log('Inserted food:', insertedFood);
        return insertedFood;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating food:', error);
      throw new Error('Failed to create food.');
    }
  }

  async createPlate(foodsJson: string, timestamp: Date): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('Plates')
        .insert([{ foods: foodsJson, served_at: timestamp }]);

      if (error) {
        console.error('Error inserting plate:', error);
        throw new Error(error.message);
      }

      console.log('Inserted plate:', data);

      // Update Foods table
      const foodIds = JSON.parse(foodsJson) as number[];
      await this.updateFoodsAfterPlate(foodIds, timestamp);
    } catch (error) {
      console.error('Error creating plate:', error);
      throw new Error('Failed to create plate.');
    }
  }

  async updateFoodsAfterPlate(foodIds: number[], timestamp: Date): Promise<void> {
    try {
      // Fetch foods to update based on IDs
      const { data: foodsToUpdate, error } = await this.supabase
        .from('Foods')
        .select('*')
        .in('food_id', foodIds);

      if (error) {
        console.error('Error fetching foods to update:', error);
        throw new Error(error.message);
      }

      if (foodsToUpdate) {
        const updatePromises = foodsToUpdate.map(async (food) => {
          const total_consumptions = (food.total_consumptions || 0) + 1;

          // Ensure values are valid and not undefined
          const updatedFields = {
            total_consumptions,
            last_consumption: new Date(timestamp).toISOString()
          };

          const { data: updatedFood, error: updateError } = await this.supabase
            .from('Foods')
            .update(updatedFields)
            .eq('food_id', food.food_id)
            .single();

          if (updateError) {
            console.error('Error updating food:', updateError);
            throw new Error(updateError.message);
          }

          console.log('Updated food:', updatedFood);
        });

        await Promise.all(updatePromises);
      }
    } catch (error) {
      console.error('Error updating foods after plate:', error);
      throw new Error('Failed to update foods after plate.');
    }
  }

  async getPlates(limit: number, offset: number) {
    try {
      const { data, error } = await this.supabase
        .from('Plates')
        .select('*')
        .order('served_at', { ascending: false }) // Ensure sorting
        .range(offset, offset + limit - 1); // Fetch records in the range (offset, offset + limit - 1)
  
      if (error) {
        console.error('Error fetching plates:', error);
        throw new Error(error.message);
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching plates:', error);
      throw new Error('Failed to fetch plates.');
    }
  }

  async getFoodNameById(foodId: number): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('Foods')
        .select('name')
        .eq('food_id', foodId)
        .single();
      if (error) {
        console.error('Error fetching food name:', error);
        throw new Error(error.message);
      }

      return data ? data.name : "-"; // Return the name or "-" if not found
    } catch (error) {
      console.error('Error fetching food name:', error);
      throw new Error('Failed to fetch food name.');
    }
  }

  async getLastPlateDate(): Promise<Date | null> {
    try {
      const { data, error } = await this.supabase
        .from('Plates')
        .select('served_at')
        .order('served_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching the last plate date:', error);
        throw new Error(error.message);
      }

      return data ? new Date(data.served_at) : null;
    } catch (error) {
      console.error('Error fetching the last plate date:', error);
      throw new Error('Failed to fetch the last plate date.');
    }
  }

  async getOldestFoods(limit: number): Promise<{ name: string }[]> {
    // Implement method to get oldest foods from Supabase
    // Example:
    const { data, error } = await this.supabase
      .from('Foods')
      .select('name')
      .or('blocked.is.false,blocked.is.null')
      .order('last_consumption')
      .limit(limit);
  
    if (error) {
      console.error('Error fetching oldest foods:', error.message);
      throw error;
    }
  
    return data || [];
  }
  

  async getTopConsumptionFoods(limit: number): Promise<{ name: string }[]> {
    // Implement method to get oldest foods from Supabase
    // Example:
    const { data, error } = await this.supabase
      .from('Foods')
      .select('name')
      .or('blocked.is.false,blocked.is.null')
      .order('total_consumptions', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching topconsumption foods:', error.message);
      throw error;
    }

    return data || [];
  }

  //FOR SEARCHING PLATE WITH SPECOFOC DATE IN PLATES COMPONENT
  async getPlatesByDate(date: Date): Promise<any[]> {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0); // Start of the day
  
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // End of the day
  
      const { data, error } = await this.supabase
        .from('Plates')
        .select('*')
        .gte('served_at', startDate.toISOString())
        .lte('served_at', endDate.toISOString())
        .order('served_at', { ascending: false });
  
      if (error) {
        console.error('Error fetching plates by date:', error);
        throw new Error(error.message);
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching plates by date:', error);
      throw new Error('Failed to fetch plates by date.');
    }
  }
  


}