import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BusinessOwnerModalPage } from '../business-owner-modal/business-owner-modal.page';
import { UpdateBusinessOwnerModalPage } from '../update-business-owner-modal/update-business-owner-modal.page';
import { DeleteBusinessOwnerModalPage } from '../delete-business-owner-modal/delete-business-owner-modal.page';


@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  
  userEmail!: string | null;
  businessOwnerForm: FormGroup;
  businessOwners: any[] = [];
  selectedBusinessOwner: any = null;
  // Define businessOwnerData property
  businessOwnerData: any = {};
 
  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController, // Add this line
    private router: Router,
    private modalController: ModalController
  ) {
    // Initialize the form with the specified fields and default values
    this.businessOwnerForm = this.formBuilder.group({
      email: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      adresse: ['', Validators.required],
      telephone1: ['', Validators.required],
      telephone2: [''],
      monthly_fee_paid: [null],
    });
 
  }

  async ngOnInit() {
    // Retrieve the current user's email
    await this.userService.getCurrentUserEmail().then((email) => {
      this.userEmail = email;
      console.log('email storage: ', this.userEmail);

      // Automatically fill the email field with userEmail value
      this.businessOwnerForm.get('email')?.setValue(email);
    });

    // Fetch and populate the list of business owners
    this.loadBusinessOwners();
  }

  async createBusinessOwner() { 
    const businessOwnerData = {
      ...this.businessOwnerForm.value,
      email: this.userEmail,
      monthly_fee_paid: false,
    };

    // Check if a business owner with the same email already exists
    const existingBusinessOwners = await this.userService.getBusinessOwnersByFields({ email: businessOwnerData.email });
    if (existingBusinessOwners.length > 0) {
      // Display an alert if a business owner with the same email exists
      this.showBusinessOwnerExistsAlert();
      return; // Exit the method to prevent duplicate creation
    }

    // Create a modal to confirm the operation
    const modal = await this.modalController.create({
      component: BusinessOwnerModalPage,
      componentProps: { businessOwnerData },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data === true) {
        // User confirmed, proceed with creation
        this.performBusinessOwnerCreation(businessOwnerData);
      }
    });

    await modal.present();

  }

  private async performBusinessOwnerCreation(businessOwnerData: any) {
    try {
      // Create the new business owner and wait for the result
      const newBusinessOwner = await this.userService.createBusinessOwner(
        businessOwnerData
      );

      // Add the newly created business owner to the list
      this.businessOwners.push(newBusinessOwner);

      // Clear the form after successful creation
      this.resetForm();

      // Navigate to the dashboard
      this.router.navigateByUrl('/villes-commerces', { replaceUrl: true });
    } catch (error) {
      // Handle any errors that might occur during creation
      console.error('Error creating business owner:', error);
    }
  }

  async showBusinessOwnerExistsAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Business Owner Exists',
      message: 'A business owner with the same email already exists.',
      buttons: ['OK'],
      cssClass: 'custom-alert',
    });
  
    await alert.present();
  }

  async updateBusinessOwner() {
    const currentUserEmail = this.businessOwnerForm?.get('email')?.value;
  
    // Check if currentUserEmail is null or undefined before using it
    if (currentUserEmail !== null && currentUserEmail !== undefined) {
      // Check if the business owner with the current email exists
      const businessOwnersBelongingToCurrentUser = await this.userService.getBusinessOwnersByCurrentUser(currentUserEmail);
  
      if (businessOwnersBelongingToCurrentUser.length > 0) {
        // Create a modal to confirm the update operation
        const modal = await this.modalController.create({
          component: UpdateBusinessOwnerModalPage,
          componentProps: { businessOwnerData: businessOwnersBelongingToCurrentUser[0] },
        });
    
        modal.onDidDismiss().then((result) => {
          if (result.data === true) {
            this.loadBusinessOwners();
          }
        });
  
        await modal.present();
      } else {
        // Display an alert if the business owner does not exist
        this.showBusinessOwnerNotFoundAlert();
      }
    } else {
      // Handle error: currentUserEmail is null or undefined
    }
  }
  
  async showBusinessOwnerNotFoundAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Business Owner Not Found',
      message: 'The business owner with the specified email does not exist.',
      buttons: ['OK'],
      cssClass: 'custom-alert',
    });
  
    await alert.present();
  }
   

  private async performBusinessOwnerUpdate(email: string) {
    try {
      const businessOwnerData = this.businessOwnerForm.value;
      // Perform the update operation based on the email field as a unique identifier
      await this.userService.updateBusinessOwnerByEmail(email, businessOwnerData);

      // Handle success, e.g., show a success message
      // Navigate to the dashboard
      this.router.navigateByUrl('/villes-commerces', { replaceUrl: true });
    } catch (error) {
      // Handle any errors that might occur during the update
      console.error('Error updating business owner:', error);
    }
  }

  /* async deleteBusinessOwner() {
    const currentUserEmail = this.businessOwnerForm?.get('email')?.value;

    // Check if currentUserEmail is null or undefined before using it
    if (currentUserEmail !== null && currentUserEmail !== undefined) {
      // Perform a delete operation based on the email field as a unique identifier
      await this.userService.deleteBusinessOwnerByEmail(currentUserEmail);

      // Handle success, e.g., show a success message
    } else {
      // Handle error: currentUserEmail is null or undefined
    }
  } */

  async deleteBusinessOwner() {
    const currentUserEmail = this.businessOwnerForm?.get('email')?.value;

    // Check if currentUserEmail is null or undefined before using it
    if (currentUserEmail !== null && currentUserEmail !== undefined) {
      // Create a modal to confirm the delete operation
      const modal = await this.modalController.create({
        component: DeleteBusinessOwnerModalPage,
        componentProps: { businessOwnerData: this.selectedBusinessOwner },
      });

      modal.onDidDismiss().then((result) => {
        if (result.data === true) {
          // User confirmed, proceed with the delete
          this.performBusinessOwnerDelete(currentUserEmail);
        }
      });

      await modal.present();
    } else {
      // Handle error: currentUserEmail is null or undefined
    }
  }

  private async performBusinessOwnerDelete(email: string) {
    try {
      // Perform the delete operation based on the email field as a unique identifier
      await this.userService.deleteBusinessOwnerByEmail(email);

      // Handle success, e.g., show a success message
    } catch (error) {
      // Handle any errors that might occur during the delete
      console.error('Error deleting business owner:', error);
    }
  }

  resetForm() {
    if (this.businessOwnerForm) {
      this.businessOwnerForm.reset({
        email: this.businessOwnerForm.get('email')?.value || '',
        monthly_fee_paid: false,
      });
    }
  }

  async loadBusinessOwners() {
    if (this.userEmail) {
      this.businessOwners = await this.userService.getBusinessOwnersByCurrentUser(this.userEmail);
  
      // If there are business owners, set the first one as the selected one
      if (this.businessOwners.length > 0) {
        this.selectBusinessOwner(this.businessOwners[0]);
      }
    }
  }
  
 
  selectBusinessOwner(owner: any) {
    this.selectedBusinessOwner = owner;
    this.businessOwnerForm.setValue({
      email: owner.email,
      name: owner.name,
      adresse: owner.adresse,
      telephone1: owner.telephone1,
      telephone2: owner.telephone2,
      monthly_fee_paid: owner.monthly_fee_paid,
    });
  }

  // Function to check form validity for enabling or disabling the create button
  checkFormValidity() {
    const name = this.businessOwnerForm.get('name')?.value ?? '';
    const adresse = this.businessOwnerForm.get('adresse')?.value ?? '';
    const telephone1 = this.businessOwnerForm.get('telephone1')?.value ?? '';
    const telephone2 = this.businessOwnerForm.get('telephone2')?.value ?? '';

    const isCreateButtonActive =
      (name && adresse && telephone1) ||
      (name && adresse && telephone2);

    // Enable or disable the create button based on form validity
    if (isCreateButtonActive) {
      this.businessOwnerForm.get('email')?.enable(); // Enable the email field when the button is active
    } else {
      this.businessOwnerForm.get('email')?.disable(); // Disable the email field when the button is inactive
    }
  }

}
