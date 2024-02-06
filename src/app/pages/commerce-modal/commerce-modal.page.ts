import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-commerce-modal',
  templateUrl: './commerce-modal.page.html',
  styleUrls: ['./commerce-modal.page.scss'],
})
export class CommerceModalPage implements OnInit {

  @Input() commerceData: any;

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  confirm() {
    // Handle confirmation logic here (e.g., save the record)
    // Once the operation is complete, close the modal
    this.modalController.dismiss(true);
  }

  ngOnInit() {
  }

} 
