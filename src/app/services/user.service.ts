import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular'; // Updated import
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private supabase: SupabaseClient;

  private currentUserEmailKey = 'currentUserEmail';
  constructor(private storage: Storage) {
    this.initStorage(); // Initialize storage when the service is created
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }
 
  // Initialize storage
  async initStorage() {
    await this.storage.create();
  }

  // Set the current user's email in Ionic Storage
  async setCurrentUserEmail(email: string) {
    await this.storage.set(this.currentUserEmailKey, email);
  }

  // Get the current user's email from Ionic Storage
  async getCurrentUserEmail(): Promise<string | null> {
    return await this.storage.get(this.currentUserEmailKey);
  }

  // Get all villes from Supabase
  async getAllVilles(): Promise<any[]> {
    const { data, error } = await this.supabase.from('villes').select('*');

    if (error) {
      console.error('Error fetching villes:', error.message);
      return [];
    }

    return data || [];
  }

  async createBusinessOwner(businessOwnerData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('business_owners')
      .insert([businessOwnerData]);
    if (error) {
      console.error('Error creating business owner:', error.message);
      throw error;
    }

    return data;
  }

  async updateBusinessOwnerByEmail(email: string, businessOwnerData: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('business_owners')
        .update(businessOwnerData)
        .eq('email', email);

      if (error) {
        console.error('Error updating business owner by email:', error.message);
        throw error;
      }

      return true; // Return true if there is no error
    } catch (error) {
      console.error('Error updating business owner by email:', error);
      return false;
    }

  }

  async deleteBusinessOwnerByEmail(email: string): Promise<void> {
    const { error } = await this.supabase
      .from('business_owners')
      .delete()
      .eq('email', email);

    if (error) {
      console.error('Error deleting business owner by email:', error.message);
      throw error;
    }
  }

  // Retrieve business-owners belonging to the current user
  async getBusinessOwnersByCurrentUser(currentUserEmail: string): Promise<any[]> {
    try {
      // Step 1: Retrieve all business-owners
      const { data: allBusinessOwners, error } = await this.supabase
        .from('business_owners')
        .select('*');

      if (error) {
        console.error('Error fetching business-owners:', error.message);
        return [];
      }

      // Step 2: Filter business-owners belonging to the current user
      const businessOwnersBelongingToCurrentUser = allBusinessOwners.filter(
        (businessOwner) => businessOwner.email === currentUserEmail
      );

      return businessOwnersBelongingToCurrentUser;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getBusinessOwnersByFields(queryFields: any): Promise<any[]> {
    const conditions = [
      `email.eq.${queryFields.email}`,
      `name.eq.${queryFields.name}`,
      `adresse.eq.${queryFields.adresse}`
    ];

    if (queryFields.telephone1) {
      conditions.push(`telephone1.eq.${queryFields.telephone1}`);
    }
    if (queryFields.telephone2) {
      conditions.push(`telephone2.eq.${queryFields.telephone2}`);
    }

    const { data, error } = await this.supabase
      .from('business_owners')
      .select('*')
      .or(conditions.join(', '));

    if (error) {
      console.error('Error fetching business owners:', error.message);
      return [];
    }

    return data || [];
  }

  async updateMonthlyFeePaid(businessOwnerId: string, monthlyFeePaid: boolean): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('business_owners')
        .update({ monthly_fee_paid: monthlyFeePaid })
        .eq('id', businessOwnerId);
  
      if (error) {
        console.error('Error updating monthly fee paid:', error.message);
        throw error;
      }
  
      return true; // Return true if there is no error
    } catch (error) {
      console.error('Error updating monthly fee paid:', error);
      return false;
    }
  }

  // Get the monthly_fee_paid status for a business owner
  async getMonthlyFeePaidStatus(businessOwnerId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('business_owners')
        .select('monthly_fee_paid')
        .eq('id', businessOwnerId)
        .single();

      if (error) {
        console.error('Error fetching monthly fee paid status:', error);
        return false; // Handle the error as needed
      }

      // If data is not null, return the monthly_fee_paid value
      return data ? data.monthly_fee_paid : false;
    } catch (error) {
      console.error('Error fetching monthly fee paid status:', error);
      return false; // Handle the error as needed
    }
  }
  

}
