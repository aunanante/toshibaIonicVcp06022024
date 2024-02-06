import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from 'src/app/services/payment.service';
import { AlertController, NavController } from '@ionic/angular';
import { AbstractControl } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { ModalController } from '@ionic/angular';
import { EnterCustomValuesModalPage } from 'src/app/pages/enter-custom-values-modal/enter-custom-values-modal.page';
import { EnterCustomRenewalValuesModalPage } from 'src/app/pages/enter-custom-renewal-values-modal/enter-custom-renewal-values-modal.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})

export class PaymentsPage implements OnInit {

  paymentForm!: FormGroup;
  businessOwnerIdExistInBusinessOwnersPayments!: boolean;
  remainingDays: number | undefined;
  currentDate!: string;

  defaultFirstPaymentData = {
    amount: 0.1,
    durationMonths: 0.1,
    paymentDate: new Date().toISOString(),
    expiryDate: this.calculateExpiryDateWithDuration(new Date(), 0.1),
  };

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private paymentService: PaymentService,
    private alertController: AlertController,
    private modalController: ModalController,
    private router: Router) { }

  async ngOnInit() {
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0)]], // Amount field added
      durationMonths: [0.1, Validators.required],
      paymentDate: [null, Validators.required],
      expiryDate: [null, Validators.required],
    });

    this.currentDate = new Date().toISOString();

    try {
      const businessOwnerId = await this.getCurrentBusinessOwnerId();

      if (businessOwnerId) {
        this.businessOwnerIdExistInBusinessOwnersPayments = await this.paymentService.checkBusinessOwnerIdInBusinessOwnersPayments(businessOwnerId);
        if (this.businessOwnerIdExistInBusinessOwnersPayments) {
          this.setRenewPaymentDefaultValues(businessOwnerId);
        } else {
          this.setFirstPaymentDefaultValues();
        }
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.presentErrorAlert('Error', 'An error occurred while initializing the payment form.');
    }
  }

  private setFirstPaymentDefaultValues() {
    // Set default values for the first payment
    const defaultFirstPaymentData = {
      amount: 0.1,
      durationMonths: 0.1,
      paymentDate: new Date().toISOString(),
      expiryDate: this.calculateExpiryDateWithDuration(new Date(), 0.1)
    };

    this.paymentForm.setValue(defaultFirstPaymentData);
  }

  private async setRenewPaymentDefaultValues(businessOwnerId: string) {
    try {
      // 1. Retrieve paymentId associated with the current businessOwnerId
      const paymentId = await this.paymentService.selectPaymentIdFromBusinessOwnersPayments(businessOwnerId);

      // Check if paymentId is not null before proceeding
      if (paymentId !== null) {
        try {
          // 2. Retrieve the latest payment in the payments table with paymentId
          const latestPaymentData = await this.paymentService.selectLatestPaymentDataFromPayments(paymentId);

          // Update the form with the latest payment data
          this.paymentForm.setValue({
            amount: latestPaymentData.amount,
            durationMonths: latestPaymentData.duration_months, // Adjusted field name
            paymentDate: latestPaymentData.payment_date, // Adjusted field name
            expiryDate: latestPaymentData.expiry_date, // Adjusted field name
          });

          // Update the remaining days
          this.updateRemainingDays(new Date(latestPaymentData.expiry_date));


        } catch (error) {
          console.error('Error retrieving latest payment data:', error);
          // Handle the error (e.g., show an error message)
          this.presentErrorAlert('Error', 'An error occurred while retrieving latest payment data.');
        }
      } else {
        console.error('Payment ID is null.');
        // Handle the case where paymentId is null (e.g., show an error message)
      }
    } catch (error) {
      console.error('Error in setRenewPaymentDefaultValues:', error);
      this.presentErrorAlert('Error', 'An error occurred while setting renewal payment default values.');
    }
  }

  // Method to update remaining days
  private updateRemainingDays(expiryDate: Date) {
    const currentDate = new Date();
    const remainingTime = expiryDate.getTime() - currentDate.getTime();
    this.remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  }

  // New method to retrieve the current business owner's ID
  private async getCurrentBusinessOwnerId(): Promise<string | null> {
    try {
      // Step 1: Get the current user's email from storage
      const currentUserEmail = await this.userService.getCurrentUserEmail();

      if (!currentUserEmail) {
        console.error('Current user email not found');
        return null;
      }

      // Step 2: Get business owners belonging to the current user
      const businessOwners = await this.userService.getBusinessOwnersByCurrentUser(currentUserEmail);

      if (businessOwners.length === 0) {
        alert('Business owner not found for the current user');
        return null;
      }

      // Assuming you want the first business owner if there are multiple
      const businessOwner = businessOwners[0];

      // Now, you have the business owner data, including the ID
      return businessOwner.id;
    } catch (error) {
      console.error('Error in getCurrentBusinessOwnerId:', error);
      return null;
    }
  }

  private async presentErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  calculateExpiryDateWithDuration(paymentDate: Date, durationMonths: number): Date {
    if (durationMonths >= 1) {
      // If duration is greater than or equal to 1, use the standard calculation
      return new Date(
        paymentDate.getFullYear(),
        paymentDate.getMonth() + Math.floor(durationMonths),
        paymentDate.getDate()
      );
    } else {
      // If duration is less than 1, calculate in terms of days
      return new Date(paymentDate.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
    }
  }

  // New method to make the first payment
  private async makeFirstDefaultPayment() {
    try {
      // Get the payment data from the payment form
      const paymentData = this.paymentForm.value;
      console.log('paymentData par défaut', paymentData);

      // Call the makePayment method in your PaymentService
      const paymentId = await this.paymentService.makePayment(paymentData);

      // Check if the payment was successful and a paymentId was returned
      if (paymentId) {
        // Get the current business owner's ID
        const businessOwnerId = await this.getCurrentBusinessOwnerId();

        // Check if the business owner exists
        if (businessOwnerId) {
          // Add a record to business_owners_payments
          await this.paymentService.createBusinessOwnersPayments(businessOwnerId, paymentId);

          // Add a record to access_control with access_allowed set to true
          await this.paymentService.createAccessControl(businessOwnerId)

          // Update monthly_fee_paid to true in the business_owners table
          await this.paymentService.updateBusinessOwners(businessOwnerId)

          // Show success message or navigate to another page
          this.presentSuccessAlert('Payment Successful', 'Your first payment was successful.');

          // Navigate to the dashboard or another page
          this.router.navigateByUrl('/villes-commerces', { replaceUrl: true });

        } else {
          // Handle the case where the business owner ID is not available
          this.presentErrorAlert('Error', 'Business owner ID not found.');
        }
      } else {
        // Handle the case where the payment was not successful
        this.presentErrorAlert('Payment Failed', 'An error occurred during the payment process.');
      }
    } catch (error) {
      console.error('Error making first payment:', error);
      this.presentErrorAlert('Error', 'An error occurred while making the first payment.');
    }
  }

  // New method to renew the payment
  private async defaultRenewalPayment() {
    try {
      // Get the values from the payment form
      const { amount, durationMonths } = this.paymentForm.value;

      // Create the defaultRenewPaymentData object with the current date for paymentDate
      const defaultRenewPaymentData = {
        amount,
        durationMonths,
        paymentDate: new Date().toISOString(),
        expiryDate: this.calculateExpiryDateWithDuration(new Date(), durationMonths).toISOString(),
      };

      // Log the defaultRenewPaymentData for debugging (you can remove this line in production)
      console.log('defaultRenewPaymentData:', defaultRenewPaymentData);
      
      // Convert durationMonths to an integer (considering days if less than 1 month)
      const durationMonthsAsInteger = defaultRenewPaymentData.durationMonths >= 1
        ? Math.floor(defaultRenewPaymentData.durationMonths)
        : Math.ceil(defaultRenewPaymentData.durationMonths * 30); 

      console.log('durationMonthsAsInteger', durationMonthsAsInteger);

      // Call the makePayment method with the defaultRenewPaymentData
      const paymentId = await this.paymentService.makePayment(defaultRenewPaymentData);

      // Check if the payment was successful and a paymentId was returned
      if (paymentId) {
        const businessOwnerId = await this.getCurrentBusinessOwnerId();
        // Check if the business owner exists
        if (businessOwnerId) { 
          // update record to business_owners_payments
          await this.paymentService.updateBusinessOwnersPayments(businessOwnerId, paymentId);

          // update record to access_control with access_allowed set to true
          await this.paymentService.updateAccessControl(businessOwnerId)

          // Update monthly_fee_paid to true in the business_owners table
          await this.paymentService.updateBusinessOwners(businessOwnerId)

          // Show success message or navigate to another page
          this.presentSuccessAlert('Payment Successful', 'Payment Renewal was successful.');

          // Navigate to the dashboard or another page
          this.router.navigateByUrl('/villes-commerces', { replaceUrl: true });

        } else {
          // Handle the case where the business owner ID is not available
          this.presentErrorAlert('Error', 'Business owner ID not found.');
        }
      } else {
        // Handle the case where the payment was not successful
        this.presentErrorAlert('Payment Renewal Failed', 'An error occurred during the renewal process.');
      }
    } catch (error) {
      console.error('Error renewing payment:', error);
      this.presentErrorAlert('Error', 'An error occurred while renewing the payment.');
    }
  }

  private async presentSuccessAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Add the makePayment method here
  async makePayment() {
    console.log('this.businessOwnerIdExistInBusinessOwnersPayments', this.businessOwnerIdExistInBusinessOwnersPayments);
  
    if (this.businessOwnerIdExistInBusinessOwnersPayments) {
      console.log('We makeRenewPayment');
  
      try {
        // Retrieve the business owner ID
        const businessOwnerId = await this.getCurrentBusinessOwnerId();
  
        // Check if the business owner ID exists
        if (businessOwnerId) {
          // 1. Retrieve paymentId associated with the current businessOwnerId
          const paymentId = await this.paymentService.selectPaymentIdFromBusinessOwnersPayments(businessOwnerId);
  
          // Check if paymentId is not null before proceeding
          if (paymentId !== null) {
            try {
              // 2. Retrieve the latest payment in the payments table with paymentId
              const latestPaymentData = await this.paymentService.selectLatestPaymentDataFromPayments(paymentId);
  
              // Check if the latest payment data is available
              if (latestPaymentData) {
                // Check if the current date is after the expiry date
                if (new Date() >= new Date(latestPaymentData.expiry_date)) {
                  // Expiry date constraint is met, proceed with renewing payment
                  console.log('latestPaymentData', latestPaymentData);
                  this.presentRenewPaymentAlert();
                } else {
                  // Expiry date constraint is not met, show an alert
                  this.presentErrorAlert('Renewal Not Allowed', 'You cannot renew the payment before the expiry date.');
                }
              } else {
                // Handle the case where the latest payment data is not available
                this.presentErrorAlert('Error', 'Latest payment data not found.');
              }
            } catch (error) {
              console.error('Error retrieving latest payment data:', error);
              this.presentErrorAlert('Error', 'An error occurred while retrieving latest payment data.');
            }
          } else {
            // Handle the case where paymentId is null
            this.presentErrorAlert('Error', 'Payment ID not found.');
          }
        } else {
          // Handle the case where the business owner ID is not available
          this.presentErrorAlert('Error', 'Business owner ID not found.');
        }
      } catch (error) {
        console.error('Error retrieving business owner ID:', error);
        this.presentErrorAlert('Error', 'An error occurred while retrieving business owner ID.');
      }
    } else {
      console.log('We makeFirstPayment');
      this.presentFirstPaymentAlert();
    }
  } 
  


  async presentFirstPaymentAlert() {
    const alert = await this.alertController.create({
      header: 'Payment Summary',
      message: this.getPaymentSummary(),
      buttons: [
        { text: 'Cancel', role: 'cancel', handler: () => console.log('Payment canceled') },
        { text: 'OK', handler: () => this.handlePaymentChoice('default') },
        { text: 'Custom Payment', handler: () => this.handlePaymentChoice('custom') }
      ]
    });

    await alert.present();
  }

  private async handlePaymentChoice(choice: 'default' | 'custom') {
    switch (choice) {
      case 'default':
        this.makeFirstDefaultPayment();
        break;
      case 'custom':
        this.openCustomFirstPaymentValuesModal();
        break;
      default:
        console.error('Invalid payment choice:', choice);
        break;
    }
  }

  getPaymentSummary(): string {
    // Customize this method to display the summary of default payment data
    const paymentData = this.paymentForm.value;
    return `Amount: ${paymentData.amount}\nDuration Months: ${paymentData.durationMonths}\nPayment Date: ${paymentData.paymentDate}\nExpiry Date: ${paymentData.expiryDate}`;
  }

  async openCustomFirstPaymentValuesModal() {
    const defaultPaymentData = this.paymentForm.value;

    const modal = await this.modalController.create({
      component: EnterCustomValuesModalPage,
      componentProps: {
        defaultPaymentData: defaultPaymentData,
      }
    });

    modal.onDidDismiss().then(async (data) => {
      if (data.role === 'customValues') {
        const customValues = data.data;

        console.log('First payment customValues ', customValues);

        try {
          // Call the makePayment method with custom values
          const paymentId = await this.paymentService.makePayment(customValues);

          // Check if the payment was successful and a paymentId was returned
          if (paymentId) {
            // Get the current business owner's ID
            const businessOwnerId = await this.getCurrentBusinessOwnerId();

            // Check if the business owner exists
            if (businessOwnerId) {
              // Add a record to business_owners_payments
              await this.paymentService.createBusinessOwnersPayments(businessOwnerId, paymentId);

              // Add a record to access_control with access_allowed set to true
              await this.paymentService.createAccessControl(businessOwnerId);

              // Update monthly_fee_paid to true in the business_owners table
              await this.paymentService.updateBusinessOwners(businessOwnerId);

              // Show success message or navigate to another page
              this.presentSuccessAlert('Payment Successful', 'Your payment was successful.');

              // Navigate to the dashboard or another page
              this.router.navigateByUrl('/villes-commerces', { replaceUrl: true });

            } else {
              // Handle the case where the business owner ID is not available
              this.presentErrorAlert('Error', 'Business owner ID not found.');
            }
          } else {
            // Handle the case where the payment was not successful
            this.presentErrorAlert('Payment Failed', 'An error occurred during the payment process.');
          }
        } catch (error) {
          console.error('Error making payment with custom values:', error);
          this.presentErrorAlert('Error', 'An error occurred while making the payment.');
        }
      }
    });

    return await modal.present();
  }

  async presentRenewPaymentAlert() {
    const alert = await this.alertController.create({
      header: 'Renew Payment Summary',
      message: this.getRenewPaymentSummary(),
      buttons: [
        { text: 'Cancel', role: 'cancel', handler: () => console.log('Renew Payment canceled') },
        { text: 'OK', handler: () => this.handleRenewPaymentChoice('default') },
        { text: 'Custom Payment', handler: () => this.handleRenewPaymentChoice('custom') }
      ]
    });

    await alert.present();
  }

  private getRenewPaymentSummary(): string {
    // Get the values from the payment form
    const { amount, durationMonths } = this.paymentForm.value;

    // Create the defaultRenewPaymentData object with the current date for paymentDate
    const defaultRenewPaymentData = {
      amount,
      durationMonths,
      paymentDate: new Date().toISOString(),
      expiryDate: this.calculateExpiryDateWithDuration(new Date(), durationMonths).toISOString(),
    };

    // Customize this method to display the summary of default renewal payment data
    return `Amount: ${defaultRenewPaymentData.amount}\nDuration Months: ${defaultRenewPaymentData.durationMonths}\nPayment Date: ${defaultRenewPaymentData.paymentDate}\nExpiry Date: ${defaultRenewPaymentData.expiryDate}`;
  }

  private async handleRenewPaymentChoice(choice: 'default' | 'custom') {
    switch (choice) {
      case 'default':
        this.defaultRenewalPayment();
        break;
      case 'custom':
        this.openCustomRenewalValuesModal();
        break;
      default:
        console.error('Invalid renewal payment choice:', choice);
        break;
    }
  }

  async openCustomRenewalValuesModal() {
    // Get the values from the payment form
    const { amount, durationMonths } = this.paymentForm.value;

    // Create the defaultRenewPaymentData object with the current date for paymentDate
    const defaultRenewalPaymentData = {
      amount,
      durationMonths,
      paymentDate: new Date().toISOString(),
      expiryDate: this.calculateExpiryDateWithDuration(new Date(), durationMonths).toISOString(),
    };


    const modal = await this.modalController.create({
      component: EnterCustomRenewalValuesModalPage,
      componentProps: {
        defaultPaymentData: defaultRenewalPaymentData,
      }
    });

    modal.onDidDismiss().then(async (data) => {
      if (data.role === 'customValues') {
        const customValues = data.data;
        
        try {

          // Call the makePayment method with the defaultRenewPaymentData
          const paymentId = await this.paymentService.makePayment(customValues);

          // Check if the payment was successful and a paymentId was returned
          if (paymentId) {
            const businessOwnerId = await this.getCurrentBusinessOwnerId();
            // Check if the business owner exists
            if (businessOwnerId) {
              // update record to business_owners_payments
              await this.paymentService.updateBusinessOwnersPayments(businessOwnerId, paymentId);

              // update record to access_control with access_allowed set to true
              await this.paymentService.updateAccessControl(businessOwnerId)

              // Update monthly_fee_paid to true in the business_owners table
              await this.paymentService.updateBusinessOwners(businessOwnerId)

              // Show success message or navigate to another page
              this.presentSuccessAlert('Payment Successful', 'Payment Renewal was successful.');

              // Navigate to the dashboard or another page
              this.router.navigateByUrl('/villes-commerces', { replaceUrl: true });

            } else {
              // Handle the case where the business owner ID is not available
              this.presentErrorAlert('Error', 'Business owner ID not found.');
            }
          } else {
            // Handle the case where the payment was not successful
            this.presentErrorAlert('Payment Renewal Failed', 'An error occurred during the renewal process.');
          }

        } catch (error) {
          console.error('Error renewing payment with custom values:', error);
          this.presentErrorAlert('Error', 'An error occurred while renewing the payment.');
        }
      }
    });

    return await modal.present();
  }



}
