import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DetailService } from '../../services/detail.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AlertController } from '@ionic/angular';
import { ProductService } from '../../services/product.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';

@Component({
  selector: 'app-detail-add-modal',
  templateUrl: './detail-add-modal.page.html',
  styleUrls: ['./detail-add-modal.page.scss'],
})
export class DetailAddModalPage implements OnInit {

  detailForm!: FormGroup;
  @Input() product: any;

  constructor(
    private modalController: ModalController,
    private detailService: DetailService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private camera: Camera,
    private alertController: AlertController,
    private productService: ProductService,
    private fileChooser: FileChooser,
    private router: Router
  ) {
    
  }

  ngOnInit() {
    this.initForm();
    console.log('Received product:', this.product);
  }

  initForm() {
    this.detailForm = this.formBuilder.group({
      detailname: ['', Validators.required],
      description: [''],
      image: ['', Validators.required], // Remove the initial value
      business_owner_id: [this.product.business_owner_id, Validators.required],
      ville_id: [this.product.ville_id, Validators.required],
      commerce_id: [this.product.commerce_id, Validators.required],
      category_id: [this.product.category_id, Validators.required],
      product_id: [this.product.id, Validators.required],
    });
  }
  
  isConfirmDisabled(): boolean {
    return this.detailForm.invalid;
  }

  async submitForm() {
    const formData = this.detailForm?.value;
    console.log('formData: ', formData);
    console.log('isConfirmDisabled(): ', this.isConfirmDisabled());


    // Check if the image field is empty
    if (!formData || typeof formData.image !== 'string' || formData.image.trim() === '') {
      // Display an alert if there is no or empty image
      await this.presentAlert('Error', 'Please select a valid image.');
      return;
    }

    try {
      // Upload image to Supabase Storage using ProductService
      const imageUrl = await this.productService.uploadImage(formData.image);

      // Check if image upload was successful
      if (!imageUrl) {
        throw new Error('Error uploading image.');
      }

      // Set the uploaded image URL in the form data
      formData.image = imageUrl;
      console.log('formData avec image: ', formData);
      // Add details to Supabase
      const success = await this.detailService.addDetails(formData);
      console.log('success: ', success);
      // Inside the try block of submitForm
      if (success) {
        await this.presentAlert('Success', 'Detail added successfully.');

         // Navigate to '/villes-commerces'
        //  this.router.navigate(['/villes-commerces']);

        this.dismissModal(true);
      }
    } catch (error) {
      // Display a user-friendly error message
      await this.presentAlert('Error', 'Failed to submit the form. Please try again.');
      console.error('Error submitting form:', error);
    }

  }
  
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  dismissModal(reload: boolean = false) {
    this.modalController.dismiss({
      reload: reload
    });
  }

  async captureImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
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
      mediaType: this.camera.MediaType.PICTURE
    };

    try {
      const imageData = await this.camera.getPicture(options);
      this.detailForm.patchValue({ image: imageData });
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
    }
  } */

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
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
    }
  }

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
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }

}
