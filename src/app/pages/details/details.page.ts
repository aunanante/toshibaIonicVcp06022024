import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommerceService } from '../../services/commerce.service';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { DetailService } from 'src/app/services/detail.service';
import { IonContent, ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { DeleteDetailModalPage } from '../../pages/delete-detail-modal/delete-detail-modal.page';
import { DetailAddModalPage } from '../../pages/detail-add-modal/detail-add-modal.page';
import { UpdateDetailModalPage } from '../../pages/update-detail-modal/update-detail-modal.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  commerces!: any[];
  categories!: any[];
  products!: any[];
  details!: any[];
  selectedProduct: any;
  selectedCommerce: any;
  selectedCategory: any;
  selectedDetailIndex: number = 0; // Default selected index
  businessOwnerId: string = '';
  isAppLocked: boolean = false;


  constructor(
    private userService: UserService,
    private commerceService: CommerceService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private detailService: DetailService,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
  ) { }

  async ngOnInit() {
    try {
      const currentUserEmail: string | null = await this.userService.getCurrentUserEmail();

      if (currentUserEmail !== null) {
        const businessOwner = await this.commerceService.getBusinessOwnerByEmail(currentUserEmail);

        if (businessOwner) {
          const monthlyFeePaid = await this.userService.getMonthlyFeePaidStatus(businessOwner.id);

          if (!monthlyFeePaid) {
            this.lockApp();
            return;
          }

          this.commerces = await this.commerceService.getCommercesByBusinessOwner(businessOwner.id);
          
        } else {
          // Alert: Business owner not found for the current user.
          this.presentAlert('Error', 'Business owner not found for the current user.');
        }
      } else {
        // Alert: Current user email is null.
        this.presentAlert('Error', 'Current user email is null.');
      }
    } catch (error) {
      // Alert: Generic error message
      this.presentAlert('Error', 'An error occurred while getting user information. Please try again.');
    }
  }

  async presentAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async onCommerceChange() {
    // Check if a commerce is selected
    if (this.selectedCommerce) {
      try {
        // Use this.selectedCommerce directly as the commerce ID
        this.categories = await this.categoryService.getAllCategoriesByCommerceId(this.selectedCommerce);
      } catch (error) {
        // Handle error fetching categories
        console.error('Error fetching categories:', error);
      }
    } else {
      // Reset categories if no commerce is selected
      this.categories = [];
    }
  }

  async onCategoryChange() {
    // Check if a category is selected
    if (this.selectedCategory) {
      try {
        // Fetch products based on the selected category
        this.products = await this.productService.getAllProductsByCategory(this.selectedCategory);

        // Reset the selected product and details when the category changes
        this.selectedProduct = null;
        this.details = [];
      } catch (error) {
        // Handle error fetching products
        console.error('Error fetching products:', error);
      }
    } else {
      // Reset products and details if no category is selected
      this.products = [];
      this.details = [];
    }
  }

  async onProductChange() {
    // Check if a product is selected
    if (this.selectedProduct) {
      try {
        // Fetch details based on the selected commerce, category, and product
        this.details = await this.detailService.getDetailsByCommerceIdCategoryIdProductId(
          this.selectedCommerce,
          this.selectedCategory,
          this.selectedProduct
        );
      } catch (error) {
        // Handle error fetching details
        console.error('Error fetching details:', error);
      }
    } else {
      // Reset details if no product is selected
      this.details = [];
    }
  }

  async navigateToFirstDetail() {
    this.selectedDetailIndex = 0;
    // Additional logic if needed
    this.scrollToSelectedDetail();
  }

  async navigateToPreviousDetail() {
    if (this.selectedDetailIndex > 0) {
      this.selectedDetailIndex--;
      // Additional logic if needed
      this.scrollToSelectedDetail();
    }
  }

  async navigateToNextDetail() {
    if (this.selectedDetailIndex < this.details.length - 1) {
      this.selectedDetailIndex++;
      // Additional logic if needed
      this.scrollToSelectedDetail();
    }
  }

  async navigateToLastDetail() {
    this.selectedDetailIndex = this.details.length - 1;
    // Additional logic if needed
    this.scrollToSelectedDetail();
  }

  selectDetail(index: number) {
    this.selectedDetailIndex = index;
    // Additional logic if needed
  }

  // Add a method to determine if a detail is selected
  isDetailSelected(index: number): boolean {
    return this.selectedDetailIndex === index;
  }

  private scrollToSelectedDetail() {
    setTimeout(() => {
      const selectedDetailElement = document.getElementById(`detail-${this.selectedDetailIndex}`);
      if (selectedDetailElement) {
        selectedDetailElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 100); // Adjust the timeout value as needed
  }

  /* async addDetail() {


    if (!this.selectedProduct) {
      this.presentAlert('Error', 'Please select a product before adding a detail.');
      return;
    }

    // Fetch the product details based on the product ID
    const myProduct = await this.productService.getProductByProductId(this.selectedProduct);

    const modal = await this.modalController.create({
      component: DetailAddModalPage,
      componentProps: {
        product: myProduct,
      },
    });

    modal.onDidDismiss().then((data) => {
      // Handle data returned from the modal if needed
      if (data?.data) {
        // Refresh details or perform other actions as needed
        this.getDetails();
      }
    });

    return await modal.present();
  } */

  async addDetail() {
    if (!this.selectedProduct) {
      this.presentAlert('Error', 'Please select a product before adding a detail.');
      return;
    }
  
    // Fetch the product details based on the product ID
    const myProduct = await this.productService.getProductByProductId(this.selectedProduct);
  
    const modal = await this.modalController.create({
      component: DetailAddModalPage,
      componentProps: {
        product: myProduct,
      },
    });
  
    modal.onDidDismiss().then((data) => {
      // Handle data returned from the modal if needed
      if (data?.data) {
        // After adding a new detail, refresh the details for the first product of the first category
        this.refreshDetailsForFirstProduct();
      }
    });
  
    return await modal.present();
  }
  
  private async refreshDetailsForFirstProduct() {
    // Check if there is at least one product and one category
    if (this.products.length > 0 && this.categories.length > 0) {
      // Get the first product and category IDs
      const firstProductId = this.products[0].id;
      const firstCategoryId = this.categories[0].id;
  
      // Fetch details based on the first commerce, category, and product
      this.details = await this.detailService.getDetailsByCommerceIdCategoryIdProductId(
        this.selectedCommerce,
        firstCategoryId,
        firstProductId
      );
    } else {
      // If there are no products or categories, reset the details
      this.details = [];
    }
  }
  

  private async getDetails() {
    // Implement logic to refresh the details based on the selected commerce, category, and product
    // You can reuse the existing code to fetch details
    // Example:
    // this.details = await this.detailService.getDetailsByCommerceIdCategoryIdProductId(
    //   this.selectedCommerce,
    //   this.selectedCategory,
    //   this.selectedProduct
    // );
  }

  async updateDetail() {
    if (!this.details || this.details.length === 0) {
      this.presentAlert('Error', 'Please select a detail to update.');
      return;
    }
  
    if (this.selectedDetailIndex === null || this.selectedDetailIndex < 0 || this.selectedDetailIndex >= this.details.length) {
      this.presentAlert('Error', 'Invalid detail selected.');
      return;
    }
  
    const selectedDetail = this.details[this.selectedDetailIndex];
  
    if (!selectedDetail) {
      this.presentAlert('Error', 'Invalid detail selected.');
      return;
    }
  
    const modal = await this.modalController.create({
      component: UpdateDetailModalPage,
      componentProps: {
        detail: selectedDetail,
      },
    });
  
    modal.onDidDismiss().then(async (data) => {
      // Handle data returned from the modal if needed
      if (data?.data) {
        // After updating a detail, refresh the details for the first product of the first category
        await this.refreshDetailsForFirstProduct();
      }
    });
  
    return await modal.present();
  }
  
  /* async deleteDetail() {
    // Check if there are details to delete
    if (!this.details || this.details.length === 0) {
      this.presentAlert('Error', 'Please select a detail to delete.');
      return;
    }
  
    // Check if a valid detail is selected
    if (this.selectedDetailIndex === null || this.selectedDetailIndex < 0 || this.selectedDetailIndex >= this.details.length) {
      this.presentAlert('Error', 'Invalid detail selected.');
      return;
    }
  
    // Get the selected detail
    const selectedDetail = this.details[this.selectedDetailIndex];
  
    // Check if a valid detail is found
    if (!selectedDetail) {
      this.presentAlert('Error', 'Invalid detail selected.');
      return;
    }
   
    // Open the DeleteDetailModalPage with the selected detail as a prop
    const modal = await this.modalController.create({
      component: DeleteDetailModalPage,
      componentProps: {
        detail: selectedDetail,
      },
    });
  
    // Handle the result when the modal is dismissed
    modal.onDidDismiss().then((data) => {
      // Handle data returned from the modal if needed
      if (data?.data) {
        // Refresh details or perform other actions as needed
        this.getDetails();
      }
    });
  
    // Display the modal
    await modal.present();
  } */

  async deleteDetail() {
    // Check if there are details to delete
    if (!this.details || this.details.length === 0) {
      this.presentAlert('Error', 'Please select a detail to delete.');
      return;
    }
  
    // Check if a valid detail is selected
    if (this.selectedDetailIndex === null || this.selectedDetailIndex < 0 || this.selectedDetailIndex >= this.details.length) {
      this.presentAlert('Error', 'Invalid detail selected.');
      return;
    }
   
    // Get the selected detail
    const selectedDetail = this.details[this.selectedDetailIndex];
  
    // Check if a valid detail is found
    if (!selectedDetail) {
      this.presentAlert('Error', 'Invalid detail selected.');
      return;
    }
  
    // Open the DeleteDetailModalPage with the selected detail as a prop
    const modal = await this.modalController.create({
      component: DeleteDetailModalPage,
      componentProps: {
        detail: selectedDetail,
      },
    });
  
    // Handle the result when the modal is dismissed
    modal.onDidDismiss().then(async (data) => {
      // Handle data returned from the modal if needed
      if (data?.data) {
        // After deleting a detail, refresh the details for the first product of the first category
        await this.refreshDetailsForFirstProduct();
      }
    });
  
    // Display the modal
    await modal.present();
  }

  lockApp() {
    this.isAppLocked = true;
    // Disable form controls or redirect to a locked page
    //this.commerceForm.disable();
    // Example: Show a locked message or redirect to a locked page
    this.router.navigate(['/villes-commerces']);
  }


}
