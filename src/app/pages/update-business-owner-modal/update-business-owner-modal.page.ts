import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-business-owner-modal',
  templateUrl: './update-business-owner-modal.page.html',
  styleUrls: ['./update-business-owner-modal.page.scss'],
})
export class UpdateBusinessOwnerModalPage implements OnInit {
  @Input() businessOwnerData: any;
  businessOwnerForm!: FormGroup;
  formModified = false;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private userService: UserService,
    private router: Router
  ) {
    // Initialize the form
    this.businessOwnerForm = this.formBuilder.group({
      name: ['', Validators.required],
      adresse: [''],
      telephone1: ['', Validators.required],
      telephone2: [''],
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async confirm() {
    // Check if the form is modified
    if (!this.formModified) {
      // No changes, show alert and return
      await this.showNoChangesAlert();
      this.modalController.dismiss(false);  // Dismiss with false to indicate no changes
      return;
    }
  
    // Handle confirmation logic here (e.g., update the record)
    try {
      const newBusinessOwnerData = this.constructNewBusinessOwnerData();
      const success = await this.userService.updateBusinessOwnerByEmail(newBusinessOwnerData.email, newBusinessOwnerData);
  
      console.log('success : ', success);
      if (success) {
        this.dismissModal(true); // Reload products on success
        // Navigate to the /villes-commerces route
        this.router.navigate(['/villes-commerces']);
      }
    } catch (error) {
      // Handle any errors that might occur during the update
      console.error('Error updating business owner:', error);
      this.dismissModal(false);  // Dismiss with false to indicate failure
    }
  }
  
  dismissModal(result: boolean) {
    this.modalController.dismiss(result);
  }
  


  constructNewBusinessOwnerData(): any {
    const formValues = this.businessOwnerForm.value;

    // Combine original data with modified fields
    const newBusinessOwnerData = {
      ...this.businessOwnerData,
      name: formValues.name,
      adresse: formValues.adresse,
      telephone1: formValues.telephone1,
      telephone2: formValues.telephone2,
    };

    return newBusinessOwnerData;
  }


  ngOnInit() {
    // Set form values in ngOnInit
    this.businessOwnerForm.setValue({
      name: this.businessOwnerData.name,
      adresse: this.businessOwnerData.adresse,
      telephone1: this.businessOwnerData.telephone1,
      telephone2: this.businessOwnerData.telephone2,
    });

    /* // Subscribe to form changes to track modifications
    this.businessOwnerForm.valueChanges.subscribe(() => {
      this.formModified = true;
    }); */

    
  }

  private async showNoChangesAlert() {
    const alert = await this.alertController.create({
      header: 'No Changes',
      message: 'There are no changes to save.',
      buttons: ['OK']
    });

    await alert.present();
  }

  onInputChange() {
    this.formModified = true;
  }

}
