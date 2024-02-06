import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router'; // Import the Router

@Component({
  selector: 'app-update-category-modal',
  templateUrl: './update-category-modal.page.html',
  styleUrls: ['./update-category-modal.page.scss'],
})
export class UpdateCategoryModalPage implements OnInit {

  @Input() categoryData: any;
  
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
