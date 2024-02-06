import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController } from '@ionic/angular';
import { ProductService } from '../../services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Router } from '@angular/router';


@Component({
  selector: 'app-update-product-modal',
  templateUrl: './update-product-modal.page.html',
  styleUrls: ['./update-product-modal.page.scss'],
})
export class UpdateProductModalPage implements OnInit {

  productForm: FormGroup;
  @Input() product: any;
  private formModified: boolean = false;

  constructor(
    private modalController: ModalController,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private camera: Camera,
    private alertController: AlertController,
    private fileChooser: FileChooser,
    private router: Router
  ) {
    this.productForm = this.formBuilder.group({
      productname: ['', Validators.required],
      reference: [''],
      price: [0, Validators.min(0)],
      description: [''],
      image: ['', Validators.required],
    });

  }

  ngOnInit() {
    this.product = this.navParams.get('product');
    this.productForm.patchValue({
      productname: this.product.productname,
      reference: this.product.reference,
      price: this.product.price,
      description: this.product.description,
      image: this.product.image,
    });
  }

  async submitForm() {

    // Check if the form has been modified
    if (!this.formModified) {
      // Show an alert to inform the user that there are no changes
      await this.presentAlert('No Changes', 'There are no changes to save.');
      return;
    }
    if (this.productForm.valid && this.formModified) {
      // Disable the button to prevent multiple clicks
      const confirmButton = document.getElementById('confirmButton');
      if (confirmButton) {
        confirmButton.setAttribute('disabled', 'true');
      }

      const formData = this.productForm.value;

      // Check if the image field is empty
      if (!formData || typeof formData.image !== 'string' || formData.image.trim() === '') {
        // Display an alert if there is no or empty image
        this.presentAlert('Error', 'Please select a valid image.');
        return;
      }

      try {

        // Upload the image to Supabase Storage
        formData.image = await this.productService.uploadImage(formData.image);

        // Update the product using the updated image URL
        const success = await this.productService.updateProduct(this.product.id, formData);

        if (success) {
          await this.presentAlert('Success', 'Product updated successfully.');
          this.dismissModal(true); // Reload products on success
          // Navigate to the /villes-commerces route
          // this.router.navigate(['/villes-commerces']);
        }
      } catch (error) {
        console.error('Error updating product:', error);
        this.presentAlert('Error', 'Failed to update product.');
      } finally {
        // Re-enable the button after the update process is complete
        if (confirmButton) {
          confirmButton.removeAttribute('disabled');
        }
      }
    }
  }


  /* async submitForm() {
    const formData = this.productForm.value;

    // Check if the image field is empty
    if (!formData || typeof formData.image !== 'string' || formData.image.trim() === '') {
      // Display an alert if there is no or empty image
      this.presentAlert('Error', 'Please select a valid image.');
      return;
    }

    try {
      // Upload the image to Supabase Storage
      formData.image = await this.productService.uploadImage(formData.image);

      // Update the product using the updated image URL
      const success = await this.productService.updateProduct(this.product.id, formData);

      if (success) {
        this.dismissModal(true); // Reload products on success
      }
    } catch (error) {
      console.error('Error updating product:', error);
      this.presentAlert('Error', 'Failed to update product.');
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
      this.productForm.patchValue({ image: imageData });
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
      this.productForm.patchValue({ image: imageData });
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
      this.productForm.patchValue({ image: imageUri });
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
            const defaultImageUrl = 'https://ik.imagekit.io/demo/tr:di-medium_cafe_B1iTdD0C.jpg/non_existent_image.jpg';
            this.productForm.patchValue({ image: defaultImageUrl });
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
      this.productForm.patchValue({ image: imageUri });
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
