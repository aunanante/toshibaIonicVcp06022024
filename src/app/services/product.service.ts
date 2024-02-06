import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular'; // Updated import
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Create a new product
  async createProduct(productData: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('products')
        .insert([productData]);

      if (error) {
        throw error;
      }

      return true; // Product created successfully
    } catch (error) {
      console.error('Error creating product:', error);
      return false;
    }
  }


  // Update an existing product
  async updateProduct(productId: number, productData: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (error) {
        throw error;
      }

      return true; // Return true if there is no error
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  }


  // Delete a product (provide productId as an argument)
  async deleteProduct(productId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }

      return true; // Product deleted successfully
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Get all products by commerce_id and category_id
  async getAllProductsByCommerceAndCategory(commerceId: number, categoryId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('commerce_id', commerceId)
        .eq('category_id', categoryId);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Get product ID by product details
  async getProductIdBy(productname: string, commerceId: number, categoryId: number): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('id')
        .eq('productname', productname)
        .eq('commerce_id', commerceId)
        .eq('category_id', categoryId);

      if (error) {
        throw error;
      }

      return data && data.length > 0 ? data[0].id : null; // Return the first matching product's ID
    } catch (error) {
      console.error('Error fetching product ID:', error);
      return null;
    }
  }

  // Get all products by category_id
  async getAllProductsByCategory(categoryId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // Get the first product by category_id
  async getFirstProduct(categoryId: number): Promise<any | null> {
    try {
      const products = await this.getAllProductsByCategory(categoryId);
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error('Error fetching first product:', error);
      return null;
    }
  }

  // Get the next product by category_id and current product ID
  async getNextProduct(categoryId: number, currentProductId: number): Promise<any | null> {
    try {
      const products = await this.getAllProductsByCategory(categoryId);
      const currentIndex = products.findIndex((product) => product.id === currentProductId);
      const nextIndex = (currentIndex + 1) % products.length;
      return nextIndex >= 0 ? products[nextIndex] : null;
    } catch (error) {
      console.error('Error fetching next product:', error);
      return null;
    }
  }

  // Get the previous product by category_id and current product ID
  async getPreviousProduct(categoryId: number, currentProductId: number): Promise<any | null> {
    try {
      const products = await this.getAllProductsByCategory(categoryId);
      const currentIndex = products.findIndex((product) => product.id === currentProductId);
      const previousIndex = (currentIndex - 1 + products.length) % products.length;
      return previousIndex >= 0 ? products[previousIndex] : null;
    } catch (error) {
      console.error('Error fetching previous product:', error);
      return null;
    }
  }

  // Get the last product by category_id
  async getLastProduct(categoryId: number): Promise<any | null> {
    try {
      const products = await this.getAllProductsByCategory(categoryId);
      return products.length > 0 ? products[products.length - 1] : null;
    } catch (error) {
      console.error('Error fetching last product:', error);
      return null;
    }
  }

  async getStorageBucketName(): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('storage')
        .select('bucket_name')
        .limit(1);

      if (error) {
        throw error;
      }

      return data && data.length > 0 ? data[0].bucket_name : null;
    } catch (error) {
      console.error('Error fetching storage bucket name:', error);
      return null;
    }
  }

  async uploadImage1(imageUri: string): Promise<string | null> {
    try {
      const bucketName = await this.getStorageBucketName();

      if (!bucketName) {
        throw new Error('Storage bucket name not found.');
      }

      const file = new File([imageUri], 'image.jpg', { type: 'image/jpeg' });
      const { data, error } = await this.supabase
        .storage
        .from(bucketName)
        .upload(`products/${Date.now()}`, file, {
          upsert: false, // set to true if you want to overwrite existing files with the same name
        });

      if (error) {
        throw error;
      }

      // Use 'path' instead of 'Key'
      return data?.path || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }


  // Get commerceId by commerceData
  async getCommerceIdByCommerce(commerceData: any): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('commerces')
        .select('id')
        .eq('commercename', commerceData.commercename)
        .eq('services', commerceData.services)
        .eq('ville_id', commerceData.ville_id)
        .eq('business_owner_id', commerceData.business_owner_id)
        .single();

      if (error) {
        throw error;
      }

      return data ? data.id : null;
    } catch (error) {
      console.error('Error fetching commerceId:', error);
      return null;
    }
  }

  // Get categoryId by categoryData
  async getCategoryIdByCategory(categoryData: any): Promise<number | null> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('id')
        .eq('categoryname', categoryData.categoryname)
        .eq('ville_id', categoryData.ville_id)
        .eq('business_owner_id', categoryData.business_owner_id)
        .eq('commerce_id', categoryData.commerce_id)
        .single();

      if (error) {
        throw error;
      }

      return data ? data.id : null;
    } catch (error) {
      console.error('Error fetching categoryId:', error);
      return null;
    }
  }

  async myListBuckets() {
    try {
      const { data, error } = await this.supabase.storage.listBuckets();

      if (error) {
        console.error('Error listing buckets:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error listing buckets:', error);
      return null;
    }
  }

  async createBucket(bucketName: string, options: any) {
    try {
      const { data, error } = await this.supabase.storage.createBucket(bucketName, options);

      if (error) {
        console.error('Error creating bucket:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating bucket:', error);
      return null;
    }
  }

  async configureBucketAccess(bucketName: string): Promise<boolean> {
    try {
      // Fetch the list of buckets available to the authenticated user
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();

      if (listError) {
        throw listError;
      }

      // Find the desired bucket by name in the list of buckets
      const targetBucket = buckets.find((bucket) => bucket.name === bucketName);

      if (targetBucket) {
        // Configure access permissions for the found bucket
        const { data, error } = await this.supabase
          .from('bucket_object_permissions')
          .upsert([
            {
              bucket_id: targetBucket.id,
              role: 'authenticated',
              permission: {
                read: true,
                create: true,
                update: true,
                delete: true,
              },
            },
          ]);

        if (error) {
          throw error;
        }

        return data ? true : false; // Bucket access configured successfully or not
      } else {
        console.error('Bucket not found:', bucketName);
        return false;
      }
    } catch (error) {
      console.error('Error configuring bucket access:', error);
      return false;
    }
  }

  async getBucketDetails(bucketName: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase.storage.getBucket(bucketName);

      if (error) {
        console.error('Error getting bucket details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting bucket details:', error);
      return null;
    }
  }

  async uploadImage(imageData: string): Promise<string | null> {
    try {
      if (imageData.startsWith('http')) {
        // This is a default image, so we can use it directly.
        return imageData;
      } else {
        // This is a captured or selected image, so we need to upload it to Supabase.
        const fileName = this.generateUniqueFileName(); // Generate a unique file name for the image
        const response = await this.supabase.storage
          .from('imageries')
          .upload(fileName, imageData, { contentType: 'image/jpeg' });

        if (response.error) {
          // Handle the error if the image upload fails.
          console.error('Error uploading image:', response.error);
          return null;
        } else {
          // Construct the URL based on the generated file name.
          const imageUrl = `${environment.supabaseUrl}/storage/v1/imageries/${fileName}`;
          return imageUrl;
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  private generateUniqueFileName(): string {
    // Generate a unique file name, for example, using a timestamp or a random string.
    // You can implement your own logic to ensure uniqueness.
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    return uniqueName;
  }

  // Get a product by its ID
  async getProductByProductId(productId: number): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  // Get all categories associated with a product
  async getCategoriesByProductId(productId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('product_id', productId);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories by product ID:', error);
      return [];
    }
  }

 
  // Add this method to your details.service.ts
  async getDetailsByProductId(productId: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('details')
        .select('*')
        .eq('product_id', productId);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching details by product ID:', error);
      return [];
    }
  }



}
