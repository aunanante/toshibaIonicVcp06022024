import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-delete-business-owner-modal',
  templateUrl: './delete-business-owner-modal.page.html',
  styleUrls: ['./delete-business-owner-modal.page.scss'],
})
export class DeleteBusinessOwnerModalPage implements OnInit {

  @Input() businessOwnerData: any;

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
