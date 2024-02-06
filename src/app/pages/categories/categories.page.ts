import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service'; // Replace with the correct path
import { UserService } from '../../services/user.service'; // Replace with the correct path
import { ModalController } from '@ionic/angular';
import { CreateCategoryModalPage } from '../create-category-modal/create-category-modal.page'; // Update the path
import { UpdateCategoryModalPage } from '../update-category-modal/update-category-modal.page'; // Update the path
import { DeleteCategoryModalPage } from '../delete-category-modal/delete-category-modal.page'; // Update the path
import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommerceService } from 'src/app/services/commerce.service';




@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})

export class CategoriesPage implements OnInit {

  commerces: any[] = [];
  selectedCommerceId!: number;
  categories: any[] = [];
  selectedCategory: any;
  isAppLocked: boolean = false;
  updatedCategories: any[] = [];
  businessOwnerId: string = '';
  categoryForm: FormGroup;
  categoryDetailsTitle: string = 'Category Details';


  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commerceService: CommerceService,
    private alertCtrl: AlertController,
  ) {
    // Initialize the form in the constructor
    this.categoryForm = this.formBuilder.group({
      categoryname: ['', Validators.required],
      business_owner_id: [{ value: '', disabled: true }],
      ville_id: [{ value: '', disabled: true }],
      commerce_id: [{ value: '', disabled: true }],
      created_at: [{ value: '', disabled: true }],
    });
  }

  ngOnInit() {
    this.checkMonthlyFeePaidStatus();
  }

  async loadCommercesForCurrentUser() {
    try {
      const userEmail = await this.getCurrentLoggedInUserEmail();
      if (userEmail !== null) {
        const businessOwnerId = await this.getBusinessOwnerIdByEmail(userEmail);
        if (businessOwnerId !== null) {
          // Fetch the monthly_fee_paid status
          const monthlyFeePaid = await this.userService.getMonthlyFeePaidStatus(businessOwnerId);

          if (monthlyFeePaid) {
            // Load commerces only if the fee is paid
            this.commerces = await this.getAllCommercesByBusinessOwnerId(businessOwnerId);

            if (this.commerces.length > 0) {
              // Select the first commerce and load its categories by default
              this.selectCommerce(this.commerces[0].id);
            }
          } else {
            // Fee not paid, handle accordingly (e.g., show a message or redirect)
            this.lockApp();
          }
        } else {
          console.error('Business owner ID not found.');
        }
      } else {
        console.error('User email not found.');
      }
    } catch (error) {
      console.error('Error loading commerces:', error);
    }
  }

  async getCurrentLoggedInUserEmail(): Promise<string | null> {
    const userEmail = await this.userService.getCurrentUserEmail(); // Use userService to get the user's email
    return userEmail;
  }

  async getBusinessOwnerIdByEmail(userEmail: string): Promise<string | null> {
    try {
      const businessOwnerId = await this.categoryService.getBusinessOwnerIdByEmail(userEmail);
      return businessOwnerId;
    } catch (error) {
      console.error('Error fetching business owner ID:', error);
      return null;
    }
  }

  async getAllCommercesByBusinessOwnerId(businessOwnerId: string): Promise<any[]> {
    try {
      const commerces = await this.categoryService.getAllCommercesByBusinessOwnerId(businessOwnerId);
      return commerces;
    } catch (error) {
      console.error('Error fetching commerces:', error);
      return []; // Return an empty array in case of an error
    }
  }

  async selectCommerce(commerceId: number) {
    this.selectedCommerceId = commerceId;
    // Load categories for the selected commerce
    this.loadCategoriesByCommerceId(commerceId);
  }

  async loadCategoriesByCommerceId(commerceId: number) {
    // Call the service method to get categories for the selected commerce
    this.categories = await this.categoryService.getAllCategoriesByCommerceId(commerceId);

    // Display details of the first category by default
    if (this.categories.length > 0) {
      this.selectedCategory = this.categories[0];

      // Fill the form with details of the first category
      this.getCategoryDetails(this.selectedCategory.id);
    } else {
      this.selectedCategory = null;
      // Reset the form if there are no categories
      this.resetForm();
    }
  }

  async openCreateCategoryModal() {
    try {
      if (!this.selectedCategory || !this.selectedCategory.id) {
        console.error('No selected category or category id found.');
        return;
      }

      // Get category data from the selected category
      const categoryId = this.selectedCategory.id;
      let categoryData = await this.categoryService.getCategoryByCategoryId(categoryId);

      if (!categoryData) {
        console.error('Failed to retrieve category data.');
        return;
      }

      // Create categoryDataToTest by combining form data with categoryData
      const categoryDataToTest = {
        categoryname: this.categoryForm.value.categoryname,
        business_owner_id: categoryData.business_owner_id,
        ville_id: categoryData.ville_id,
        commerce_id: categoryData.commerce_id,
        created_at: categoryData.created_at,  // Include created_at for categoryDataToTest
      };

      // Check if the category already exists
      const isCategoryExists = await this.categoryService.isAlreadyPresent(categoryDataToTest);

      if (isCategoryExists) {
        // If the category exists, show an alert
        this.presentAlert('Category Already Exists', 'The category already exists. Please choose a different name.');
      } else {
        // Create categoryDataProps by excluding created_at
        const categoryDataProps = {
          categoryname: this.categoryForm.value.categoryname,
          business_owner_id: categoryData.business_owner_id,
          ville_id: categoryData.ville_id,
          commerce_id: categoryData.commerce_id,
          // Exclude created_at from the object
        };

        // Set props for the modal with the retrieved category data and commerce details
        const modal = await this.modalController.create({
          component: CreateCategoryModalPage,
          componentProps: { categoryDataProps },
        });

        modal.onDidDismiss().then((result) => {
          if (result.data === true) {
            // User confirmed, proceed with creation

            this.createCategory(categoryDataProps);
          }
        });

        /* modal.onDidDismiss().then((result) => {
          if (result.data && result.data.confirm) {
            // If the user confirms, create the category
            // this.createCategory(result.data.categoryname, result.data.ville_id, result.data.business_owner_id, result.data.commerce_id);
            this.createCategory(categoryDataProps);
            // Display the first category of the current commerce
            this.displayFirstCategory();
          }
        }); */

        await modal.present();
      }
    } catch (error) {
      console.error('Error opening create category modal:', error);
    }
  }

  async createCategory(categoryDataProps: any) {
    try {

      // Create the new category and wait for the result
      const newCategory = await this.categoryService.createCategory(categoryDataProps);

      if (newCategory) {
        // If the category creation was successful, update the local 'categories' array
        // Add the newly created category to the list
        this.categories.push(newCategory);

        // Clear the form after successful creation
        this.resetForm();

        // Refresh the list of commerces
        this.loadCommercesForCurrentUser()
      } else {
        console.error('Category creation failed.');
      }

    } catch (error) {
      console.error('Error creating category:', error);
    }
  }


  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  /* async openUpdateCategoryModal() {
    if (this.selectedCategory) {
      const modal = await this.modalController.create({
        component: UpdateCategoryModalPage,
        componentProps: { categoryData: this.selectedCategory },
      });

      modal.onDidDismiss().then((result) => {
        if (result.data === true) {
          // User confirmed, proceed with the update
          this.performCategoryUpdate(this.selectedCategory.id);
        }
      });

      await modal.present();

    } else {
      // Handle error: selectedCategory is null or undefined
    }
  }

  private async performCategoryUpdate(existingCategoryId: number) {
    try {
      const categoryData = this.categoryForm.value;
      
      // Perform the update operation based on the existingCategoryId field as a unique identifier
      await this.categoryService.updateCategoryName(existingCategoryId, categoryData);

      // Find the index of the updated commerce in the array
      const updatedCategoryIndex = this.categories.findIndex(c => c.id === existingCategoryId);


      // Update the category in the array
      this.categories[updatedCategoryIndex] = { id: existingCategoryId, ...categoryData };

      // Refresh the list of commerces
      this.loadCommercesForCurrentUser()

    } catch (error) {
      // Handle any errors that might occur during the update
      console.error('Error updating commerce:', error);
    }
  } */

  async openUpdateCategoryModal() {
    if (this.selectedCategory) {
      const modal = await this.modalController.create({
        component: UpdateCategoryModalPage,
        componentProps: { categoryData: { ...this.selectedCategory, ...this.categoryForm.value } },
      });
  
      modal.onDidDismiss().then((result) => {
        if (result.data === true) {
          // User confirmed, proceed with the update only if the category name has changed
          if (this.isCategoryNameChanged(this.selectedCategory, this.categoryForm.value)) {
            this.performCategoryUpdate(this.selectedCategory.id);
          } else {
            this.showNoChangesAlert();
          }
        }
      });
  
      await modal.present();
  
    } else {
      // Handle error: selectedCategory is null or undefined
    }
  }
  
  private isCategoryNameChanged(currentCategory: any, formValues: any): boolean {
    // Check if the category name has changed
    return formValues.categoryname !== currentCategory.categoryname;
  }
  
  private async showNoChangesAlert() {
    const alert = await this.alertCtrl.create({
      header: 'No Changes Detected',
      message: 'There are no changes to update.',
      buttons: ['OK'],
      cssClass: 'custom-alert',
    });
    await alert.present();
  }
  
  private async performCategoryUpdate(existingCategoryId: number) {
    try {
      const categoryData = this.categoryForm.value;
  
      // Perform the update operation based on the existingCategoryId field as a unique identifier
      await this.categoryService.updateCategoryName(existingCategoryId, categoryData);
  
      /* // Find the index of the updated category in the array
      const updatedCategoryIndex = this.categories.findIndex(c => c.id === existingCategoryId);
  
      // Update the category in the array
      this.categories[updatedCategoryIndex] = { id: existingCategoryId, ...categoryData }; */
  
      // Refresh the list of categories
      this.loadCommercesForCurrentUser();
  
    } catch (error) {
      // Handle any errors that might occur during the update
      console.error('Error updating category:', error);
    }
  }
  

  async openDeleteCategoryModal() {
    if (this.selectedCategory) {
      const alert = await this.alertController.create({
        header: 'Confirm Deletion',
        message: `Are you sure you want to delete the category ${this.selectedCategory.categoryname}?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: async () => {
              // Call the service method to delete the category
              const categoryDeleted = await this.categoryService.deleteCategory(this.selectedCategory.id);
              if (categoryDeleted) {
                // Reload categories after deleting a category
                // this.loadCategoriesByCommerceId(this.selectedCommerceId);
                this.loadCommercesForCurrentUser()
              }
            }
          }
        ]
      });
  
      await alert.present();
    }
  }
  
  async resetForm() {
    try {
      if (!this.selectedCommerceId) {
        console.error('No selected commerce id found.');
        return;
      }

      // Retrieve current commerce details
      const commerceDetails = await this.commerceService.getCommerceById(this.selectedCommerceId);

      if (!commerceDetails) {
        console.error('Failed to retrieve commerce details.');
        return;
      }

      // Clear the category name and set other properties from the current commerce
      this.categoryForm.reset({
        categoryname: '', // Clear the category name
        business_owner_id: commerceDetails.business_owner_id,
        ville_id: commerceDetails.ville_id,
        commerce_id: commerceDetails.id,
        created_at: '', // Set this property accordingly if needed
      });

      console.log({
        categoryname: '', // Clear the category name
        business_owner_id: commerceDetails.business_owner_id,
        ville_id: commerceDetails.ville_id,
        commerce_id: commerceDetails.id,
        created_at: '', // Set this property accordingly if needed
      });
    } catch (error) {
      console.error('Error resetting form:', error);
    }
  }




  async selectCategory(category: any) {
    this.selectedCategory = category;

    // Fill the form with details of the selected category
    this.getCategoryDetails(this.selectedCategory.id);
  }

  async getCategoryDetails(categoryId: string) {
    try {
      const categoryDetails = await this.categoryService.getCategoryByCategoryId(categoryId);

      if (categoryDetails) {
        // Set the retrieved details to the form controls
        this.categoryForm.patchValue({
          categoryname: categoryDetails.categoryname,
          business_owner_id: categoryDetails.business_owner_id,
          ville_id: categoryDetails.ville_id,
          commerce_id: categoryDetails.commerce_id,
          created_at: categoryDetails.created_at,
        });
      } else {
        console.error('Category details not found.');
      }
    } catch (error) {
      console.error('Error retrieving category details:', error);
    }
  }

  async checkMonthlyFeePaidStatus() {
    try {
      // Fetch the current user's email from Ionic Storage
      const currentUserEmail = await this.userService.getCurrentUserEmail();

      if (currentUserEmail) {
        const businessOwners = await this.userService.getBusinessOwnersByCurrentUser(currentUserEmail);

        if (businessOwners.length > 0) {
          this.businessOwnerId = businessOwners[0].id;

          // Fetch the monthly_fee_paid status
          const monthlyFeePaid = await this.userService.getMonthlyFeePaidStatus(this.businessOwnerId);

          if (!monthlyFeePaid) {
            this.lockApp();
            return;
          }
          // Continue loading commerces if the fee is paid
          await this.loadCommercesForCurrentUser();
        } else {
          console.error('No business owner found for the current user email.');
        }
      } else {
        console.error('User email not available.');
      }
    } catch (error) {
      console.error('Error checking monthly fee paid status:', error);
    }
  }

  lockApp() {
    // Disable form controls or redirect to a locked page
    this.isAppLocked = true;
    // Example: Show a locked message or redirect to a locked page
    this.router.navigate(['/villes-commerces']);
  }


}
