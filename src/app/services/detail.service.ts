import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient or any other method you use for data fetching
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DetailService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getDetailsByCommerceIdCategoryIdProductId(commerceId: number, categoryId: number, productId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('details')
        .select('*')
        .eq('commerce_id', commerceId)
        .eq('category_id', categoryId)
        .eq('product_id', productId);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching details:', error);
      return [];
    }
  }

  async addDetails(detailData: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('details')
        .insert([detailData]);

      if (error) {
        throw error;
      }

      return true; // Detail added successfully
    } catch (error) {
      console.error('Error adding detail:', error);
      return false;
    }
  }

  // Update an existing detail
  async updateDetails(detailId: number, updatedData: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('details')
        .update(updatedData)
        .eq('id', detailId);

      if (error) {
        console.error('Error updating detail:', error);
        return false; // Detail not updated
      }

      return true; // Detail updated successfully
    } catch (error) {
      console.error('Error updating detail:', error);
      return false;
    }
  }



  // Delete a detail (provide detailId as an argument)
  async deleteDetails(detailId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('details')
        .delete()
        .eq('id', detailId);

      if (error) {
        throw error;
      }
 
      return true; // Detail deleted successfully
    } catch (error) {
      console.error('Error deleting detail:', error);
      return false;
    }
  }

  async getDetailIdByDetailData(detailData: any): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('details')
        .select('id')
        .eq('detailname', detailData.detailname)
        .eq('description', detailData.description)
        .eq('image', detailData.image)
        .eq('commerceId', detailData.commerceId)
        .eq('categoryId', detailData.categoryId)
        .eq('productId', detailData.productId);

      if (error) {
        throw error;
      }

      return data && data.length > 0 ? data[0].id : null;
    } catch (error) {
      console.error('Error fetching detail ID:', error);
      return null;
    }
  }

  /* // Inside DetailService
  async updateDetail(detailId: number, updatedData: any): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('details')
        .update(updatedData)
        .eq('id', detailId);

      if (error) {
        throw error;
      }

      return data ? true : false; // Detail updated successfully or not
    } catch (error) {
      console.error('Error updating detail:', error);
      return false;
    }
  } */

  async deleteDetail(detailId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('details')
        .delete()
        .eq('id', detailId);

      if (error) {
        throw error;
      }

      return true; // Detail deleted successfully
    } catch (error) {
      console.error('Error deleting detail:', error);
      return false;
    }
  }
}
