import { Component, OnInit } from '@angular/core';
import { CommerceService } from 'src/app/services/commerce.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CommerceModalPage } from '../commerce-modal/commerce-modal.page';
import { UpdateCommerceModalPage } from '../update-commerce-modal/update-commerce-modal.page';
import { DeleteCommerceModalPage } from '../delete-commerce-modal/delete-commerce-modal.page';


@Component({
  selector: 'app-commerces',
  templateUrl: './commerces.page.html',
  styleUrls: ['./commerces.page.scss'],
})
export class CommercesPage implements OnInit {

  commerceForm: FormGroup;
  businessOwnerId: string = ''; // Initialize it here
  commerces: any[] = [];
  selectedCommerce: any;
  selectedVille: any; // This will hold the selected ville
  villes: any[] = [];
  searchTerm: string = '';
  filteredVilles: any[] = [];
  currentCommerce: any; // Replace 'any' with the actual type of your commerce data



  constructor(
    private formBuilder: FormBuilder,
    private commerceService: CommerceService,
    private userService: UserService,
    private alertCtrl: AlertController,
    private router: Router,
    private modalController: ModalController
  ) {
    this.commerceForm = this.formBuilder.group({
      commercename: ['', Validators.required],
      services: ['', Validators.required],
      ville_id: ['', Validators.required],
      business_owner_id: [{ value: '', disabled: true }] // Disable the field here
    });
  }
 
  async ngOnInit() {
    try {
      // Fetch the current user's email from Ionic Storage
      const currentUserEmail = await this.userService.getCurrentUserEmail();
      this.fetchVilles();
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
        } else {
          console.error('No business owner found for the current user email.');
        }
      } else {
        console.error('User email not available.');
      }

      // Fetch the list of commerces for the current user
      this.commerces = await this.commerceService.getCommercesByBusinessOwner(this.businessOwnerId);

      // Assuming you want to display the first commerce from the list in the form
      if (this.commerces.length > 0) {
        this.displayCommerceInForm(this.commerces[0]);
        this.selectedCommerce = this.commerces[0];
      }

      // Set the business_owner_id in the form
      this.commerceForm.get('business_owner_id')?.setValue(this.businessOwnerId);
    } catch (error) {
      console.error('Error fetching commerces:', error);
    }
  }

  async fetchVilles() {
    try {
      this.villes = await this.userService.getAllVilles();
      // Initialize the filteredVilles with all villes
      this.filteredVilles = this.villes;
    } catch (error) {
      console.error('Error fetching villes:', error);
    }
  }

  onSearchChange(event: any) {
    // Filter the villes based on the searchTerm
    const searchTerm = event.detail.value.toLowerCase();
    this.filteredVilles = this.villes.filter((ville) =>
      ville.villename.toLowerCase().includes(searchTerm)
    );
  }

  async createCommerce() {
    const commerceData = {
      ...this.commerceForm.value,
      business_owner_id: this.businessOwnerId // Set business_owner_id to the appropriate value (e.g., obtained from currentUserEmail)
    };

    // Check if the table is not empty before checking for an existing commerce
    if (this.commerces.length > 0) {
      // Check if a commerce with the same id already exists
      const existingCommerceId = await this.commerceService.getCommerceIdByCommerce(commerceData);
      if (existingCommerceId) {
        // Display an alert if a commerce with the same id exists
        this.showCommerceExistsAlert();
        return; // Exit the method to prevent duplicate creation
      }
    }

    // Create a modal to confirm the operation
    const modal = await this.modalController.create({
      component: CommerceModalPage,
      componentProps: { commerceData },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data === true) {
        // User confirmed, proceed with creation
        this.performCommerceCreation(commerceData);
      }
    });

    await modal.present();
  }

  private async performCommerceCreation(commerceData: any) {
    try {
      // Create the new commerce and wait for the result
      const newCommerce = await this.commerceService.createCommerce(commerceData);

      // Add the newly created commerce to the list
      this.commerces.push(newCommerce);

      // Clear the form after successful creation
      this.resetForm();

      // Refresh the list of commerces
      await this.refreshCommerces();

      // Navigate to the dashboard
      // this.router.navigateByUrl('/villes-commerces', { replaceUrl: true });
    } catch (error) {
      // Handle any errors that might occur during creation
      console.error('Error creating commerce:', error);
    }
  }


  async showCommerceExistsAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Commerce Exists',
      message: 'A commerce with the same id already exists.',
      buttons: ['OK'],
      cssClass: 'custom-alert',
    });
    await alert.present();
  }
  // Method to display a commerce in the form
  displayCommerceInForm(commerce: any) {
    this.commerceForm.patchValue({
      commercename: commerce.commercename,
      services: commerce.services,
      ville_id: commerce.ville_id,
    });
  }

  // Method to select a commerce
  async selectCommerce(commerce: any) {
    try {
      // Set the selectedCommerce property to the selected commerce
      this.selectedCommerce = commerce;
      this.currentCommerce = commerce; // Set the current commerce
      // You can also display the selected commerce in the form if needed
      this.displayCommerceInForm(commerce);
    } catch (error) {
      console.error('Error selecting commerce:', error);
    }
  }

  // Method to reset the commerce form
  resetForm() {
    // Reset the form to its initial state
    this.commerceForm.reset({
      commercename: '',
      services: '',
      ville_id: '',
      business_owner_id: this.businessOwnerId // Set business_owner_id to the current user's ID
    });
  }

  // Method to update a commerce
  /* async updateCommerce() {
    // risque de update du même commerce sans rien changer à regarder
    // updating a commerce is possible if a commerce is already exist
    const existingCommerceId = await this.commerceService.getCommerceIdByCommerce(this.selectedCommerce);
    if (existingCommerceId) {
      // Create a modal to confirm the update operation
      const modal = await this.modalController.create({
        component: UpdateCommerceModalPage,
        componentProps: { commerceData: this.commerceForm.value },
      });

      modal.onDidDismiss().then((result) => {
        if (result.data === true) {
          // User confirmed, proceed with the update
          this.performCommerceUpdate(existingCommerceId);
        }
      });
 
      await modal.present();
    } else {
      // Handle error: selectedCommerceId is null or undefined
    }
  } */

  async updateCommerce() {
    // Check if the currentCommerce is defined
    if (!this.currentCommerce) {
      // Handle error: currentCommerce is null or undefined
      return;
    }
  
    // Check if the form values are equal to the currentCommerce data
    if (this.areFormValuesEqual(this.commerceForm.value, this.currentCommerce)) {
      // Display an alert if the form values are equal to the currentCommerce data
      this.showNoChangesAlert();
      return;
    }
  
    // Continue with the update process
    const existingCommerceId = await this.commerceService.getCommerceIdByCommerce(this.selectedCommerce);
  
    if (existingCommerceId) {
      // Create a modal to confirm the update operation
      const modal = await this.modalController.create({
        component: UpdateCommerceModalPage,
        componentProps: { commerceData: this.commerceForm.value },
      });
  
      modal.onDidDismiss().then((result) => {
        if (result.data === true) {
          // User confirmed, proceed with the update
          this.performCommerceUpdate(existingCommerceId);
        }
      });
  
      await modal.present();
    } else {
      // Handle error: selectedCommerceId is null or undefined
    }
  }
  
  // Helper method to check if form values are equal to the currentCommerce data
  private areFormValuesEqual(formValues: any, currentCommerce: any): boolean {
    return (
      formValues.commercename === currentCommerce.commercename &&
      formValues.services === currentCommerce.services &&
      formValues.ville_id === currentCommerce.ville_id
    );
  }
  
  // Helper method to display an alert when no changes are detected
  private async showNoChangesAlert() {
    const alert = await this.alertCtrl.create({
      header: 'No Changes Detected',
      message: 'There are no changes to update.',
      buttons: ['OK'],
      cssClass: 'custom-alert',
    });
    await alert.present();
  }
  

  private async performCommerceUpdate(existingCommerceId: number) {
    try {
      const commerceData = this.commerceForm.value;
      // Perform the update operation based on the existingCommerceId field as a unique identifier
      await this.commerceService.updateCommerce(existingCommerceId, commerceData);

      // Find the index of the updated commerce in the array
      const updatedCommerceIndex = this.commerces.findIndex(c => c.id === existingCommerceId);

      // Update the commerce in the array
      this.commerces[updatedCommerceIndex] = { id: existingCommerceId, ...commerceData };

      // Refresh the list of commerces
      await this.refreshCommerces();

      // Handle success, e.g., show a success message
      // Navigate to the dashboard
      // this.router.navigateByUrl('/villes-commerces', { replaceUrl: true });
    } catch (error) {
      // Handle any errors that might occur during the update
      console.error('Error updating commerce:', error);
    }
  }


  // Method to delete a commerce
  async deleteCommerce() {
    // deleting a commerce is possible if a commerce is already exist
    const existingCommerceId = await this.commerceService.getCommerceIdByCommerce(this.selectedCommerce);
    if (existingCommerceId) {
      // Create a modal to confirm the delete operation
      const modal = await this.modalController.create({
        component: DeleteCommerceModalPage,
        componentProps: { commerceData: this.commerceForm.value },
      });

      modal.onDidDismiss().then((result) => {
        if (result.data === true) {
          // User confirmed, proceed with the update
          this.performCommerceDelete(existingCommerceId);
        }
      });

      await modal.present();
    } else {
      // Handle error: selectedCommerceId is null or undefined
    }
  }

  private async performCommerceDelete(existingCommerceId: number) {
    try {
      // Perform the delete operation based on the existingCommerceId field as a unique identifier
      await this.commerceService.deleteCommerce(existingCommerceId);

      // Find the index of the deleted commerce in the array
      const deletedCommerceIndex = this.commerces.findIndex(c => c.id === existingCommerceId);

      // Remove the deleted commerce from the array
      this.commerces.splice(deletedCommerceIndex, 1);

      // Refresh the list of commerces
      await this.refreshCommerces();

      // Handle success, e.g., show a success message
      // Navigate to the dashboard
      // this.router.navigateByUrl('/villes-commerces', { replaceUrl: true });
    } catch (error) {
      // Handle any errors that might occur during the delete
      console.error('Error deleting commerce', error);
    }
  }


  async openVillesList() {
    // Call your service method to get all villes
    try {
      const villes = await this.userService.getAllVilles();

      const buttons = villes.map((ville) => ({
        text: ville.villename,
        handler: () => {
          this.selectedVille = ville;
          this.commerceForm.get('ville_id')?.setValue(ville.id);
        },
        role: 'button',
      }));

      buttons.push({
        text: 'Cancel',
        role: 'cancel',
        handler: () => { } // Provide an empty function as the handler
      });

      // Set the CSS class directly on the alert
      const alert = await this.alertCtrl.create({
        header: 'Select a Ville',
        buttons: buttons,
        cssClass: 'villes-list', // Add the CSS class here
      });

      await alert.present();
    } catch (error) {
      console.error('Error fetching villes:', error);
    }
  }

  async onVilleChange(event: any) {
    const selectedVilleId = event.target.value as number;
    try {
      // this.villes = await this.userService.getAllVilles();
      // Update the selectedVille and set the selected ville_id
      this.selectedVille = this.villes.find((ville) => ville.id === selectedVilleId);
      this.commerceForm.get('ville_id')?.setValue(selectedVilleId);
    } catch (error) {
      console.error('Error fetching villes:', error);
    }
  }

  lockApp() {
    // Disable form controls or redirect to a locked page
    this.commerceForm.disable();
    // Example: Show a locked message or redirect to a locked page
    this.router.navigate(['/villes-commerces']);
  }

  // Inside the CommercesPage class
  async refreshCommerces() {
    try {
      // Fetch the updated list of commerces
      this.commerces = await this.commerceService.getCommercesByBusinessOwner(this.businessOwnerId);

      // Display the fields of the first commerce in the list
      if (this.commerces.length > 0) {
        this.displayCommerceInForm(this.commerces[0]);
        this.selectedCommerce = this.commerces[0];
      }
    } catch (error) {
      console.error('Error refreshing commerces:', error);
    }
  }


}
