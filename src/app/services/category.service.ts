import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Get Business Owner ID by Email
  async getBusinessOwnerIdByEmail(userEmail: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('business_owners')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (error) {
      throw error;
    }

    return data ? data.id : null;
  }

  // Get All Commerces by Business Owner ID
  async getAllCommercesByBusinessOwnerId(businessOwnerId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('commerces')
      .select('*')
      .eq('business_owner_id', businessOwnerId);

    if (error) {
      throw error;
    }

    return data || [];
  }

  // CategoryService
  async createCategory(categoryDataProps: any): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .insert([categoryDataProps])
        .select();

      if (error) {
        console.error('Error creating category:', error.message);
        throw error;
      }

      // Check if there is data returned (newly inserted record)
      const newCategory = data && data.length > 0 ? data[0] : null;

      // Return the newly inserted category
      return newCategory;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }


  // Update an existing category
  async updateCategory1(categoryname: string, ville_id: number, business_owner_id: string, commerce_id: number): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .upsert([
          {
            categoryname,
            ville_id,
            business_owner_id,
            commerce_id
          }
        ]);

      if (error) {
        throw error;
      }

      if (data) {
        return true; // Category updated successfully
      } else {
        return false; // Category update failed
      }
    } catch (error) {
      console.error('Error updating category:', error);
      return false;
    }
  }

  // Delete a category (provide category_id as an argument)
  async deleteCategory(categoryId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        throw error;
      }

      return true; // Category deleted successfully
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // Get all categories by commerce_id
  async getAllCategoriesByCommerceId(commerce_id: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('commerce_id', commerce_id);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories by commerce_id:', error);
      return [];
    }
  }

  // Get category ID by category details
  async getCategoryIdBy(categoryname: string, ville_id: number, business_owner_id: string, commerce_id: number): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('id')
        .eq('categoryname', categoryname)
        .eq('ville_id', ville_id)
        .eq('business_owner_id', business_owner_id)
        .eq('commerce_id', commerce_id);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return data[0].id; // Return the first matching category's ID
      } else {
        return null; // Category not found
      }
    } catch (error) {
      console.error('Error fetching category ID:', error);
      return null;
    }
  }

  async isAlreadyPresent(categoryData: any): Promise<boolean> {
    try {
      // Check if all necessary properties are defined in categoryData
      if (
        categoryData &&
        categoryData.categoryname !== undefined &&
        categoryData.ville_id !== undefined &&
        categoryData.business_owner_id !== undefined &&
        categoryData.commerce_id !== undefined
      ) {
        const { data, error } = await this.supabase
          .from('categories')
          .select('id')
          .eq('categoryname', categoryData.categoryname)
          .eq('ville_id', categoryData.ville_id)
          .eq('business_owner_id', categoryData.business_owner_id)
          .eq('commerce_id', categoryData.commerce_id);

        if (error) {
          throw error;
        }

        return data && data.length > 0;
      } else {
        // Log which property is undefined
        console.error('Some properties in categoryData are undefined', categoryData);
        return false;
      }
    } catch (error) {
      console.error('Error checking if category is already present:', error);
      return false;
    }
  }

  // Update only the categoryname for an existing category
async updateCategoryName(categoryId: number, categoryData: any): Promise<boolean> {
  try {
    const { error } = await this.supabase
      .from('categories')
      .update({
        categoryname: categoryData.categoryname
      })
      .eq('id', categoryId);

    if (error) {
      throw error;
    }

    return true; // Category updated successfully
  } catch (error) {
    console.error('Error updating category name:', error);
    return false; // Category update failed
  }
}



  async getCategoryByCategoryId(categoryId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  }

  // Get products by Category ID
  async getProductsByCategoryId(categoryId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getFirstCategoryByCommerceId(commerceId: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('commerce_id', commerceId)
        .order('created_at') // Assuming you have a field like 'created_at' to determine the order
        .limit(1); // Limit to the first result

      if (error) {
        console.error('Error fetching first category:', error.message);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


}
