import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-enter-custom-values-modal',
  templateUrl: './enter-custom-values-modal.page.html',
  styleUrls: ['./enter-custom-values-modal.page.scss'],
})
export class EnterCustomValuesModalPage implements OnInit {

  @Input() defaultPaymentData: any;
  customPaymentForm!: FormGroup;
  currentDate!: string;

  constructor(private modalController: ModalController, private fb: FormBuilder) { }

  ngOnInit() {
    this.initializeForm();
    this.currentDate = new Date().toISOString();
  }

  initializeForm() {
    this.customPaymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0)]],
      durationMonths: [null, Validators.required],
      paymentDate: [null, Validators.required],
      expiryDate: [null, Validators.required],
    });

    // Set default values from the provided defaultPaymentData
    this.customPaymentForm.patchValue(this.defaultPaymentData);
  }
 
  onCancel() {
    // Dismiss the modal on cancel
    this.modalController.dismiss(null, 'cancel');
  }

  onConfirm() {
    // Validate the form and return custom values on confirm
    if (this.customPaymentForm.valid) {
      const customValues = this.customPaymentForm.value;
      this.modalController.dismiss(customValues, 'customValues');
    } else {
      // Handle validation errors if needed
    }
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

  // Handle the ionChange event for the durationMonths radio group
  onDurationChange(event: any): void {
    const selectedDuration = event.detail.value;
    this.updateFormControls(selectedDuration);
  }
  
  updateFormControls(selectedDuration: string): void {
    this.customPaymentForm.get('durationMonths')?.setValue(selectedDuration);
    this.customPaymentForm.get('amount')?.setValue(+selectedDuration);
  
    const paymentDate = this.customPaymentForm.get('paymentDate')?.value;
    if (paymentDate) {
      const expiryDate = this.calculateExpiryDateWithDuration(new Date(paymentDate), +selectedDuration);
      this.customPaymentForm.get('expiryDate')?.setValue(expiryDate);
    }
  }  

  onPaymentDateChange(): void {
    // Get the selected payment date
    const paymentDate = this.customPaymentForm.get('paymentDate')?.value;
  
    if (paymentDate) {
      // Parse the payment date string to a JavaScript Date object
      const parsedPaymentDate = new Date(paymentDate);
  
      // Get the selected duration
      const selectedDuration = this.customPaymentForm.get('durationMonths')?.value;
  
      // Recalculate expiryDate based on the selected payment date and duration
      const expiryDate = this.calculateExpiryDateWithDuration(parsedPaymentDate, +selectedDuration);
  
      // Update the expiryDate form control
      this.customPaymentForm.get('expiryDate')?.setValue(expiryDate);
    }
  }
  

}
