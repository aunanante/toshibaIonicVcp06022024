import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-update-commerce-modal',
  templateUrl: './update-commerce-modal.page.html',
  styleUrls: ['./update-commerce-modal.page.scss'],
})
export class UpdateCommerceModalPage implements OnInit {

  @Input() commerceData: any;

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }
 
  confirm() {
    // Handle confirmation logic here (e.g., update the record)
    // Once the operation is complete, close the modal
    this.modalController.dismiss(true);
  }

  ngOnInit() {
  }

}
