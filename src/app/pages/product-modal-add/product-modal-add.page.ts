import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProductService } from '../../services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-product-modal-add',
  templateUrl: './product-modal-add.page.html',
  styleUrls: ['./product-modal-add.page.scss'],
})
export class ProductModalAddPage implements OnInit {

  // Define @Input properties
  @Input() commerceId!: number;
  @Input() categoryId!: number;
  @Input() categoryname!: string;
  @Input() business_owner_id!: number;
  @Input() ville_id!: number;

  // Define the form group
  productForm!: FormGroup;

  constructor(
    private modalController: ModalController,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private camera: Camera,
    private alertController: AlertController,
    private fileChooser: FileChooser,
    private router: Router
  ) {

  }

  async ngOnInit() {
    this.initForm();

    // Retrieve the details of the 'imageries' bucket
    const bucketDetails = await this.productService.getBucketDetails('imageries');
    console.log('Bucket Details:', bucketDetails);

    // List buckets
    const buckets = await this.productService.myListBuckets();
    console.log('Buckets:', buckets);
  }

  initForm() {
    this.productForm = this.formBuilder.group({
      productname: ['', Validators.required],
      reference: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      image: ['', Validators.required],
      business_owner_id: [this.business_owner_id, Validators.required],
      ville_id: [this.ville_id, Validators.required],
      commerce_id: [this.commerceId, Validators.required],
      category_id: [this.categoryId, Validators.required],
    });
  }

  isConfirmDisabled(): boolean {
    return this.productForm.invalid;
  }

  async submitForm() {
    const formData = this.productForm?.value;

    console.log('formData: ', formData);

    // Check if all required fields are set
    if (this.isConfirmDisabled() || !formData) {
      // Display an alert if any required field is missing
      await this.presentAlert('Error', 'Please fill in all required fields.');
      return;
    }

    // Check if the image field is empty
    if (typeof formData.image !== 'string' || formData.image.trim() === '') {
      // Display an alert if there is no or empty image
      await this.presentAlert('Error', 'Please select a valid image.');
      return;
    }

    try {
      // Upload image to Supabase Storage
      const imageUrl = await this.productService.uploadImage(formData.image);
  
      // Check if image upload was successful
      if (!imageUrl) {
        throw new Error('Error uploading image.');
      }
  
      // Set the uploaded image URL in the form data
      formData.image = imageUrl;
  
      // Create the product
      const success = await this.productService.createProduct(formData);
  
      if (success) {
        await this.presentAlert('Success', 'Product added successfully.');
        
        // Navigate to '/villes-commerces'
        // this.router.navigate(['/villes-commerces']);
        
        // Dismiss the modal
        this.dismissModal(true);
      }
   
    } catch (error) {
      // Display a user-friendly error message
      await this.presentAlert('Error', 'Failed to submit the form. Please try again.');
      console.error('Error submitting form:', error);
    }
 
  }


  async submitForm1() {
    const formData = this.productForm?.value;

    console.log('formData : ', formData)
    // Check if the image field is empty
    if (!formData || typeof formData.image !== 'string' || formData.image.trim() === '') {
      // Display an alert if there is no or empty image
      await this.presentAlert('Error', 'Please select a valid image.');
      return;
    }
 
    try {
      // Upload image to Supabase Storage
      const imageUrl = await this.productService.uploadImage(formData.image);

      // Check if image upload was successful
      if (!imageUrl) {
        throw new Error('Error uploading image.');
      }

      // Set the uploaded image URL in the form data
      formData.image = imageUrl;

      // Create the product
      const success = await this.productService.createProduct(formData);

      // Inside the try block of submitForm
      if (success) {
        await this.presentAlert('Success', 'Product added successfully.');
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

  /* async captureImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    try {
      const imageData = await this.camera.getPicture(options);
      this.productForm.patchValue({ image: imageData });
    } catch (error) {
      console.error('Error capturing image:', error);
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
            this.productForm.patchValue({ image: defaultImageUrl });
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
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
    }
  }


  /* async captureImageFromGallery() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    try {
      const imageData = await this.camera.getPicture(options);
      this.productForm.patchValue({ image: imageData });
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
    }
  } */




}
