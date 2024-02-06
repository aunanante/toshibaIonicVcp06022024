import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { CommerceService } from '../../services/commerce.service';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ProductModalAddPage } from '../../pages/product-modal-add/product-modal-add.page'; // Update the path accordingly
import { UpdateProductModalPage } from '../../pages/update-product-modal/update-product-modal.page'; // Update the path accordingly
import { DeleteProductModalPage } from '../../pages/delete-product-modal/delete-product-modal.page'; // Update the path accordingly
import { AlertController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
 

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;


  commerces: any[] = [];
  categories: any[] = [];
  selectedCommerce: number | null = null;
  selectedCategory: number | null = null;
  products: any[] = [];
  selectedProduct: any | null = null;
  previousProduct: any | null = null;
  lastProduct: any | null = null;
  businessOwnerId: string = '';
  isAppLocked: boolean = false;


  constructor(
    private commerceService: CommerceService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {

  } 

  ngOnInit(): void {
    // Initialize the page data
    this.checkMonthlyFeePaidStatus()
  }

  async getCurrentLoggedInUserEmail(): Promise<string | null> {
    const userEmail = await this.userService.getCurrentUserEmail(); // Use userService to get the user's email
    return userEmail;
  }

  async loadCommerces() {
    // Retrieve the current user's email
    const currentUserEmail = await this.getCurrentLoggedInUserEmail();

    if (currentUserEmail) {
      // Load commerces for the current user
      this.commerces = await this.commerceService.getCommercesByCurrentUser(currentUserEmail);
    } else {
      // Handle the case when the current user is null
      console.warn('No logged-in user. Redirecting to login or displaying a message...');
      // You can redirect to the login page or show a message to the user
    }
  }

  async onCommerceChange() {
    // Load categories based on the selected commerce
    if (this.selectedCommerce !== null) {
      this.categories = await this.categoryService.getAllCategoriesByCommerceId(this.selectedCommerce);
    } else {
      // Reset categories if no commerce is selected
      this.categories = [];
    }
  }

  async onCategoryChange() {
    // Check if selectedCommerce and selectedCategory are not null
    if (this.selectedCommerce !== null && this.selectedCategory !== null) {
      // Load products based on the selected category
      this.products = await this.productService.getAllProductsByCommerceAndCategory(
        this.selectedCommerce,
        this.selectedCategory
      );

      // Fetch the previous product only if selectedProduct is not null
      if (this.selectedProduct !== null) {
        this.previousProduct = await this.productService.getPreviousProduct(
          this.selectedCategory,
          this.selectedProduct.id || 0
        );
      }

      // Fetch the last product
      this.lastProduct = await this.productService.getLastProduct(this.selectedCategory);
    } else {
      // Reset products if either selectedCommerce or selectedCategory is null
      this.products = [];
    }
  }

  selectProduct(product: any) {
    this.selectedProduct = product;
  }

  async loadProducts() {
    // Load products for the initial state (considering a default category or commerce)
    const defaultCategoryId = 1; // Replace with the default category ID
  
    // Ensure that selectedCommerce and selectedCategory are set
    if (this.selectedCommerce !== null && this.selectedCategory !== null) {
      // Load products based on the selected category
      this.products = await this.productService.getAllProductsByCommerceAndCategory(
        this.selectedCommerce,
        this.selectedCategory
      );
    } else {
      // If either selectedCommerce or selectedCategory is null, fetch the products for the first category of the first commerce
      this.products = await this.productService.getAllProductsByCategory(defaultCategoryId);
  
      // Set selectedCommerce and selectedCategory to the first ones if available
      if (this.commerces.length > 0) {
        this.selectedCommerce = this.commerces[0].id;
      }
  
      if (this.categories.length > 0) {
        this.selectedCategory = this.categories[0].id;
      }
    }
  
    // Select the first product if available
    if (this.products.length > 0) {
      this.selectedProduct = this.products[0];
    }
  }
  

  async navigateToFirstProduct() {
    // Navigate to the first product
    if (this.products.length > 0) {
      this.selectedProduct = this.products[0];
      await this.scrollToSelectedProduct();
    }
  }

  async navigateToPreviousProduct() {
    // Navigate to the previous product
    const currentIndex = this.products.indexOf(this.selectedProduct);
    if (currentIndex > 0) {
      this.selectedProduct = this.products[currentIndex - 1];
      await this.scrollToSelectedProduct();
    }
  }

  async navigateToNextProduct() {
    // Navigate to the next product
    const currentIndex = this.products.indexOf(this.selectedProduct);
    if (currentIndex < this.products.length - 1) {
      this.selectedProduct = this.products[currentIndex + 1];
      await this.scrollToSelectedProduct();
    }
  }

  async navigateToLastProduct() {
    // Navigate to the last product
    if (this.products.length > 0) {
      this.selectedProduct = this.products[this.products.length - 1];
      await this.scrollToSelectedProduct();
    }
  }

  async scrollToSelectedProduct() {
    // Scroll to the selected product
    const selectedProductElement = document.getElementById(`product-${this.selectedProduct.id}`);
    if (selectedProductElement) {
      await this.content.scrollToPoint(0, selectedProductElement.offsetTop, 500);
    }
  }

  /* async addProduct() {
    // Check if both commerce and category are selected
    if (this.selectedCommerce !== null && this.selectedCategory !== null) {

      // Find the selected category object based on the ID
      const selectedCategory = this.categories.find(
        (category) => category.id === this.selectedCategory
      );
 
      if (selectedCategory) {
        // Extract the categoryname from the selected category
        const categoryname = selectedCategory.categoryname;
        const commerceId = this.selectedCommerce;
        const categoryId = this.selectedCategory;
        const business_owner_id = selectedCategory.business_owner_id;
        const ville_id = selectedCategory.ville_id;

        // Open the ProductModalAddPage as a modal
        const modal = await this.modalController.create({
          component: ProductModalAddPage,
          componentProps: {
            commerceId,
            categoryId, 
            categoryname,
            business_owner_id,
            ville_id,
          },
        });
 
        // Subscribe to the modal's close event
        modal.onDidDismiss().then((data) => {
          // Check if the modal was dismissed with data (e.g., a reload flag)
          if (data.data && data.data.reload) {
            // Reload products after adding a new product
            this.loadProducts();
          }
        });

        // Present the modal to the user
        await modal.present();
      } else {
        // Handle the case where the selected category is not found
        console.error('Selected category not found.');
      }
    } else {
      // Display an alert if commerce or category is not selected
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Please select a commerce and a category before adding a product.',
        buttons: ['OK'],
      });

      await alert.present();
    }
  } */

  async addProduct() {
    // Check if both commerce and category are selected
    if (this.selectedCommerce !== null && this.selectedCategory !== null) {
  
      // Find the selected category object based on the ID
      const selectedCategory = this.categories.find(
        (category) => category.id === this.selectedCategory
      );
  
      if (selectedCategory) {
        // Extract the categoryname from the selected category
        const categoryname = selectedCategory.categoryname;
        const commerceId = this.selectedCommerce;
        const categoryId = this.selectedCategory;
        const business_owner_id = selectedCategory.business_owner_id;
        const ville_id = selectedCategory.ville_id;
  
        // Open the ProductModalAddPage as a modal
        const modal = await this.modalController.create({
          component: ProductModalAddPage,
          componentProps: {
            commerceId,
            categoryId,
            categoryname,
            business_owner_id,
            ville_id,
          },
        }); 
  
        // Subscribe to the modal's close event
        modal.onDidDismiss().then(async (data) => {
          // Check if the modal was dismissed with data (e.g., a reload flag)
          if (data.data && data.data.reload) {
            // Reset selected commerce and category to the first one
            this.selectedCommerce = this.commerces.length > 0 ? this.commerces[0].id : null;
            this.selectedCategory = this.categories.length > 0 ? this.categories[0].id : null;
  
            // Reload products after adding a new product
            await this.loadProducts();
          }
        });
  
        // Present the modal to the user
        await modal.present();
      } else {
        // Handle the case where the selected category is not found
        console.error('Selected category not found.');
      }
    } else {
      // Display an alert if commerce or category is not selected
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Please select a commerce and a category before adding a product.',
        buttons: ['OK'],
      });
  
      await alert.present();
    }
  }
  

  /* async updateProduct() {
    // Check if a product is selected
    if (!this.selectedProduct) {
      // Display an alert if no product is selected
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Please select a product for updating.',
        buttons: ['OK'],
      });

      await alert.present();
      return;
    }

    // Open the UpdateProductModalPage as a modal
    const modal = await this.modalController.create({
      component: UpdateProductModalPage,
      componentProps: {
        product: this.selectedProduct,
      }, 
    });

    // Subscribe to the modal's close event
    modal.onDidDismiss().then((data) => {
      // Check if the modal was dismissed with data (e.g., a reload flag)
      if (data.data && data.data.reload) {
        // Reload products after updating the product
        this.loadProducts();
      }
    });

    // Present the modal to the user
    await modal.present();
  } */

  async updateProduct() {
    // Check if a product is selected
    if (!this.selectedProduct) {
      // Display an alert if no product is selected
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Please select a product for updating.',
        buttons: ['OK'],
      });
  
      await alert.present();
      return;
    }
  
    // Open the UpdateProductModalPage as a modal
    const modal = await this.modalController.create({
      component: UpdateProductModalPage,
      componentProps: {
        product: this.selectedProduct,
      },
    });
  
    // Subscribe to the modal's close event
    modal.onDidDismiss().then(async (data) => {
      // Check if the modal was dismissed with data (e.g., a reload flag)
      if (data.data && data.data.reload) {
        // Reset selected commerce and category to the first one
        this.selectedCommerce = this.commerces.length > 0 ? this.commerces[0].id : null;
        this.selectedCategory = this.categories.length > 0 ? this.categories[0].id : null;
  
        // Reload products after updating the product
        await this.loadProducts();
      }
    });
  
    // Present the modal to the user
    await modal.present();
  }
  

 /*  async deleteProduct() {
    // Check if a product is selected
    if (!this.selectedProduct) {
      // Display an alert if no product is selected
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Please select a product for deletion.',
        buttons: ['OK'],
      });

      await alert.present();
      return;
    }
 
    // Open the DeleteProductModalPage as a modal
    const modal = await this.modalController.create({
      component: DeleteProductModalPage,
      componentProps: {
        product: this.selectedProduct,
      },
    });

    // Subscribe to the modal's close event
    modal.onDidDismiss().then((data) => {
      // Check if the modal was dismissed with data (e.g., a reload flag)
      if (data.data && data.data.reload) {
        // Reload products after deleting the product
        this.loadProducts();
      }
    });

    // Present the modal to the user
    await modal.present();
  } */

  async deleteProduct() {
    // Check if a product is selected
    if (!this.selectedProduct) {
      // Display an alert if no product is selected
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Please select a product for deletion.',
        buttons: ['OK'],
      });
  
      await alert.present();
      return;
    }
  
    // Open the DeleteProductModalPage as a modal
    const modal = await this.modalController.create({
      component: DeleteProductModalPage,
      componentProps: {
        product: this.selectedProduct,
      },
    });
  
    // Subscribe to the modal's close event
    modal.onDidDismiss().then(async (data) => {
      // Check if the modal was dismissed with data (e.g., a reload flag)
      if (data.data && data.data.reload) {
        // Reset selected commerce and category to the first one
        this.selectedCommerce = this.commerces.length > 0 ? this.commerces[0].id : null;
        this.selectedCategory = this.categories.length > 0 ? this.categories[0].id : null;
  
        // Reload products after deleting the product
        await this.loadProducts();
      }
    });
  
    // Present the modal to the user
    await modal.present();
  }
  

  isProductSelected(productId: number): boolean {
    return this.selectedProduct && this.selectedProduct.id === productId;
  }
  
  sanitizeImageURL(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
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
          // Continue loading data if the fee is paid
          this.loadCommerces(); // or any other data loading method
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
