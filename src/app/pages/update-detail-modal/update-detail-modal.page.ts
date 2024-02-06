import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController } from '@ionic/angular';
import { DetailService } from '../../services/detail.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ProductService } from '../../services/product.service'; // Import ProductService
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Router } from '@angular/router';


@Component({
  selector: 'app-update-detail-modal',
  templateUrl: './update-detail-modal.page.html',
  styleUrls: ['./update-detail-modal.page.scss'],
})
export class UpdateDetailModalPage implements OnInit {

  detailForm: FormGroup;
  @Input() detail: any;
  private formModified: boolean = false;

  constructor(
    private modalController: ModalController,
    private detailService: DetailService,
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private camera: Camera,
    private alertController: AlertController,
    private productService: ProductService,
    private fileChooser: FileChooser,
    private router: Router
  ) {
    this.detailForm = this.formBuilder.group({
      detailname: ['', Validators.required],
      description: [''],
      image: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.detail = this.navParams.get('detail');
    this.detailForm.patchValue({
      detailname: this.detail.detailname,
      description: this.detail.description,
      image: this.detail.image,
    });
  }

  async submitForm() {

    // Check if the form has been modified
    if (!this.formModified) {
      // Show an alert to inform the user that there are no changes
      await this.presentAlert('No Changes', 'There are no changes to save.');
      return;
    }
    if (this.detailForm.valid && this.formModified) {

      // Disable the button to prevent multiple clicks
      const confirmButton = document.getElementById('confirmButton');
      if (confirmButton) {
        confirmButton.setAttribute('disabled', 'true');
      }

      const formData = this.detailForm.value;

      // Check if the image field is empty
      if (!formData || typeof formData.image !== 'string' || formData.image.trim() === '') {
        // Display an alert if there is no or empty image
        this.presentAlert('Error', 'Please select a valid image.');
        return;
      }

      try {
        // Upload the image to Supabase Storage
        formData.image = await this.productService.uploadImage(formData.image);

        // Update the detail using the updated image URL
        const success = await this.detailService.updateDetails(this.detail.id, formData);
        if (success) {
          this.dismissModal(true); // Reload details on success
          // Navigate to the /villes-commerces route
          // this.router.navigate(['/villes-commerces']);
        }
      } catch (error) {
        console.error('Error updating detail:', error);
        this.presentAlert('Error', 'Failed to update detail.');
      } finally {
        // Re-enable the button after the update process is complete
        if (confirmButton) {
          confirmButton.removeAttribute('disabled');
        }
      }
    }
  }

  /* async submitForm() {
    const formData = this.detailForm.value;

    // Check if the image field is empty
    if (!formData || typeof formData.image !== 'string' || formData.image.trim() === '') {
      // Display an alert if there is no or empty image
      this.presentAlert('Error', 'Please select a valid image.');
      return;
    }
 
    try {
      // Upload the image to Supabase Storage
      formData.image = await this.productService.uploadImage(formData.image);

      // Update the detail using the updated image URL
      const success = await this.detailService.updateDetail(this.detail.id, formData);

      if (success) {
        this.dismissModal(true); // Reload details on success
      }
    } catch (error) {
      console.error('Error updating detail:', error);
      this.presentAlert('Error', 'Failed to update detail.');
    }
  } */
  
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  dismissModal(reload: boolean = false) {
    this.modalController.dismiss({
      reload: reload,
    });
  }

  async captureImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    try {
      const imageData = await this.camera.getPicture(options);
      this.detailForm.patchValue({ image: imageData });
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }

  /* async selectImageFromGallery() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    try {
      const imageData = await this.camera.getPicture(options);
      this.detailForm.patchValue({ image: imageData });
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
    }
  } */

  async takenWithCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    try {
      const imageUri = await this.camera.getPicture(options);
      this.detailForm.patchValue({ image: imageUri });
      this.formModified = true;
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }

  async selectImageFromGallery() {
    const alert = await this.alertController.create({
      header: 'Select Image',
      message: 'Do you want to select a default image?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Default Image',
          handler: () => {
            // Use the direct link to the image file
            const defaultImageUrl = 'https://ionicframework.com/docs/img/demos/card-media.png';
            this.detailForm.patchValue({ image: defaultImageUrl });
            this.formModified = true;
          },
        },
        {
          text: 'Gallery',
          handler: () => {
            // User chose to select an image from the gallery
            this.selectedInTheGallery();
          },
        },
      ],
    });

    await alert.present();
  }

  async selectedInTheGallery() {
    try {
      const imageUri = await this.fileChooser.open();
      this.detailForm.patchValue({ image: imageUri });
      this.formModified = true;
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
    }
  }

  onInputChange(event: Event) {
    console.log('Input changed:', (event.target as HTMLInputElement).value);
    // Your logic here...
    this.formModified = true;
  }

}
