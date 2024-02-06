import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-delete-commerce-modal',
  templateUrl: './delete-commerce-modal.page.html',
  styleUrls: ['./delete-commerce-modal.page.scss'],
})
export class DeleteCommerceModalPage implements OnInit {

  @Input() commerceData: any;

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  confirm() {
    // Handle confirmation logic here (e.g., delete the record)
    // Once the operation is complete, close the modal
    this.modalController.dismiss(true);
  }

  ngOnInit() {
  }

}
