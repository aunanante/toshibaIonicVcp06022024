import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CategoryService } from '../../services/category.service'; // Replace with the correct path
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-category-modal',
  templateUrl: './create-category-modal.page.html',
  styleUrls: ['./create-category-modal.page.scss'],
})
export class CreateCategoryModalPage implements OnInit {

  @Input() categoryDataProps: any;

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
