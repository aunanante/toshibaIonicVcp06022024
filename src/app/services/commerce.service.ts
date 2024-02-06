import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CommerceService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async createCommerce(commerceData: any): Promise<any> {
    try {
      const { data, error } = await this.supabase.from('commerces').insert([commerceData]);
      if (error) {
        console.error('Error creating commerce:', error.message);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getCommerceIdByCommerce(commerce: any): Promise<number | null> {
    try {
      const { data: foundCommerce, error } = await this.supabase
        .from('commerces')
        .select('id')
        .eq('commercename', commerce.commercename)
        .eq('services', commerce.services)
        .eq('ville_id', commerce.ville_id)
        .eq('business_owner_id', commerce.business_owner_id)
        .single(); // Use single() if you expect only one result

      if (error) {
        console.error('Error fetching commerce:', error.message);
        return null;
      }

      return foundCommerce ? foundCommerce.id : null;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getCommercesByCurrentUser(currentUserEmail: string): Promise<any[]> {
    try {
      // Step 1: Retrieve the business owner ID of the current user
      const businessOwner = await this.getBusinessOwnerByEmail(currentUserEmail);

      if (!businessOwner) {
        // No business owner found for the current user
        return [];
      }

      const currentBusinessOwnerId = businessOwner.id;

      // Step 2: Retrieve all commerces owned by the current business owner
      const { data: commerces, error } = await this.supabase
        .from('commerces')
        .select('*')
        .eq('business_owner_id', currentBusinessOwnerId);

      if (error) {
        console.error('Error fetching commerces:', error.message);
        return [];
      }

      return commerces || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Helper method to retrieve a business owner by email
  async getBusinessOwnerByEmail(email: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('business_owners')
        .select('*')
        .eq('email', email);

      if (error) {
        console.error('Error fetching business owner:', error.message);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Fetch commerces by business_owner_id
  async getCommercesByBusinessOwner(businessOwnerId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select('*')
        .eq('business_owner_id', businessOwnerId);

      if (error) {
        console.error('Error fetching commerces:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Update an existing commerce owned by the current business owner
  async updateCommerce(commerceId: number, commerceData: any): Promise<any> {
    try {
      // Perform an update query to update the commerce record
      const { data, error } = await this.supabase
        .from('commerces')
        .update(commerceData)
        .eq('id', commerceId);

      if (error) {
        console.error('Error updating commerce:', error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Delete a commerce owned by the current business owner
  async deleteCommerce(commerceId: number): Promise<void> {
    try {
      // Perform a delete query to delete the commerce record
      const { error } = await this.supabase
        .from('commerces')
        .delete()
        .eq('id', commerceId);

      if (error) {
        console.error('Error deleting commerce:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Fetch all commerces from the commerces table
  async getAllCommerces(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select('*');

      if (error) {
        console.error('Error fetching all commerces:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Fetch all commerces by villeId from the commerces table
  async getAllCommercesByVilleId(villeId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select('*')
        .eq('ville_id', villeId);

      if (error) {
        console.error(`Error fetching commerces for villeId ${villeId}:`, error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Fetch all villes from the villes table
  async getAllVilles(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('villes')
        .select('*');

      if (error) {
        console.error('Error fetching all villes:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Update the getFilteredCommerces method
  async getFilteredCommerces(commerceName: string, villeId: number | null, serviceName: string): Promise<any[]> {
    try {
      let query = this.supabase.from('commerces').select('*');

      if (commerceName) {
        query = query.ilike('commercename', `%${commerceName}%`);
      }

      if (villeId !== null) {
        query = query.eq('ville_id', villeId);
      }

      if (serviceName) {
        // Add condition to search for services containing the specified service name
        query = query.or(`services:ilike:${serviceName}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching filtered commerces:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }




  // Fetch ville ID by ville name
  async getVilleIdByName(villeName: string): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('villes')
        .select('id')
        .eq('villename', villeName)
        .single();

      if (error) {
        console.error('Error fetching ville ID by name:', error.message);
        return null;
      }

      return data ? data.id : null;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getAllCommercesForBusinessOwnersWithMonthlyFeePaid(): Promise<any[]> {
    try {
      const { data: allCommerces, error: commerceError } = await this.supabase
        .from('commerces')
        .select('*');

      if (commerceError) {
        console.error('Error fetching all commerces:', commerceError.message);
        return [];
      }

      // Array to store commerces with monthly_fee_paid = true
      const commercesWithMonthlyFeePaid: any[] = [];

      // Iterate through each commerce
      for (const commerce of allCommerces || []) {
        const businessOwnerId = commerce.business_owner_id;

        // Retrieve business_owner record
        const { data: businessOwner, error: ownerError } = await this.supabase
          .from('business_owners')
          .select('monthly_fee_paid')
          .eq('id', businessOwnerId)
          .single();

        if (ownerError) {
          console.error('Error fetching business owner:', ownerError.message);
          continue; // Skip to the next iteration if an error occurs
        }

        // Check if monthly_fee_paid is true
        if (businessOwner && businessOwner.monthly_fee_paid === true) {
          commercesWithMonthlyFeePaid.push(commerce);
        }
      }

      return commercesWithMonthlyFeePaid;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getBusinessOwnersByCommerceBusinessOwnerId(businessOwnerId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('business_owners')
        .select('*')
        .eq('id', businessOwnerId);

      if (error) {
        console.error('Error fetching business owners:', error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getBusinessOwnerByCommerceBusinessOwnerId(businessOwnerId: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('business_owners')
        .select('*')
        .eq('id', businessOwnerId)
        .single(); // Use single() if you expect only one result

      if (error) {
        console.error('Error fetching business owner:', error.message);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getCategoriesByCommerceId(commerceId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('commerce_id', commerceId);

      if (error) {
        console.error('Error fetching categories:', error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getCommerceById(commerceId: number): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select('*')
        .eq('id', commerceId)
        .single(); // Use single() if you expect only one result

      if (error) {
        console.error('Error fetching commerce:', error.message);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Fetch ville name by ville ID
  async getVilleNameByVilleId(villeId: number): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('villes')
        .select('villename')
        .eq('id', villeId)
        .single();

      if (error) {
        console.error('Error fetching ville name by ID:', error.message);
        return null;
      }

      return data ? data.villename : null;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Fetch commerces by service name
  /* async findCommercesByServiceName(serviceName: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select('*')
        .ilike('services', `%${serviceName}%`);

      if (error) {
        console.error(`Error fetching commerces for service name ${serviceName}:`, error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  } */

  // Fetch commerces by service name
  async findCommercesByServiceName(serviceName: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select('*')
        .ilike('services', `%${serviceName}%`);

      if (error) {
        console.error(`Error fetching commerces for service name ${serviceName}:`, error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getFilteredCommercesForBusinessOwnersWithMonthlyFeePaid(commerceName: string, villeId: number | null, serviceName: string): Promise<any[]> {
    try {
      // Step 1: Retrieve all commerces matching the filter criteria
      let query = this.supabase.from('commerces').select('*');

      if (commerceName) {
        query = query.ilike('commercename', `%${commerceName}%`);
      }

      if (villeId !== null) {
        query = query.eq('ville_id', villeId);
      }

      if (serviceName) {
        // Add condition to search for services containing the specified service name
        query = query.or(`services:ilike:${serviceName}`);
      }

      const { data: filteredCommerces, error: filterError } = await query;

      if (filterError) {
        console.error('Error fetching filtered commerces:', filterError.message);
        return [];
      }

      // Step 2: Filter commerces based on whether their owners have paid the monthly fee
      const commercesWithMonthlyFeePaid: any[] = [];

      for (const commerce of filteredCommerces || []) {
        const businessOwnerId = commerce.business_owner_id;

        // Retrieve business_owner record
        const { data: businessOwner, error: ownerError } = await this.supabase
          .from('business_owners')
          .select('monthly_fee_paid')
          .eq('id', businessOwnerId)
          .single();

        if (ownerError) {
          console.error('Error fetching business owner:', ownerError.message);
          continue; // Skip to the next iteration if an error occurs
        }

        // Check if monthly_fee_paid is true
        if (businessOwner && businessOwner.monthly_fee_paid === true) {
          commercesWithMonthlyFeePaid.push(commerce);
        }
      }

      return commercesWithMonthlyFeePaid;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async findCommercesByServiceNameWithMonthlyFeePaid(serviceName: string): Promise<any[]> {
    try {
      // Step 1: Retrieve all commerces
      const { data: allCommerces, error: commerceError } = await this.supabase
        .from('commerces')
        .select('*');

      if (commerceError) {
        console.error('Error fetching all commerces:', commerceError.message);
        return [];
      }

      // Array to store commerces with monthly_fee_paid = true
      const commercesWithMonthlyFeePaid: any[] = [];

      // Normalize service name to lowercase and remove accents
      const normalizedServiceName = this.normalizeString(serviceName);

      // Iterate through each commerce
      for (const commerce of allCommerces || []) {
        const businessOwnerId = commerce.business_owner_id;

        // Retrieve business_owner record
        const { data: businessOwner, error: ownerError } = await this.supabase
          .from('business_owners')
          .select('monthly_fee_paid')
          .eq('id', businessOwnerId)
          .single();

        if (ownerError) {
          console.error('Error fetching business owner:', ownerError.message);
          continue; // Skip to the next iteration if an error occurs
        }

        // Check if monthly_fee_paid is true
        if (businessOwner && businessOwner.monthly_fee_paid === true) {
          // Check if services is a string and if it contains the normalized search term (case-insensitive)
          const services: string = commerce.services || '';

          if (typeof services === 'string') {
            // Normalize and remove accents from the services string
            const normalizedServices = this.normalizeString(services);

            // Check if the normalized services string contains the normalized search term
            if (normalizedServices.includes(normalizedServiceName)) {
              commercesWithMonthlyFeePaid.push(commerce);
            }
          }
        }
      }

      return commercesWithMonthlyFeePaid;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Helper method to normalize and remove accents from a string
  private normalizeString(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
    
  async getAllCommercesBelongingOwnersWithMonthlyFeePaid(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select(`
          id,
          commercename,
          services,
          business_owner_id,
          ville_id,
          created_at,
          business_owners (
            id,
            email,
            name,
            adresse,
            telephone1,
            telephone2,
            monthly_fee_paid
          )
        `)
        .eq('business_owners.monthly_fee_paid', true)
        .order('commercename', { ascending: true }); // Order alphabetically by commercename
  
      if (error) {
        console.error('Error fetching commerces:', error.message);
        throw error;
      }
  
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async searchCommerces(query: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select(`
          id,
          commercename,
          services,
          business_owner_id,
          ville_id,
          created_at,
          business_owners (
            id,
            email,
            name,
            adresse,
            telephone1,
            telephone2,
            monthly_fee_paid
          )
        `)
        .ilike('commercename', `%${query}%`)
        .order('commercename', { ascending: true });
  
      if (error) {
        console.error('Error searching commerces:', error.message);
        throw error;
      }
  
      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getCommercesByVilleId(villeId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select(`
          id,
          commercename,
          services,
          business_owner_id,
          ville_id,
          created_at,
          business_owners (
            id,
            email,
            name,
            adresse,
            telephone1,
            telephone2,
            monthly_fee_paid
          )
        `)
        .eq('ville_id', villeId)
        .order('commercename', { ascending: true });
  
      if (error) {
        console.error('Error fetching commerces by villeId:', error.message);
        throw error;
      }
  
      return data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  
  
}
