import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-business-owner-modal',
  templateUrl: './business-owner-modal.page.html',
  styleUrls: ['./business-owner-modal.page.scss'],
})
export class BusinessOwnerModalPage implements OnInit {

  
  @Input() businessOwnerData: any;

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
