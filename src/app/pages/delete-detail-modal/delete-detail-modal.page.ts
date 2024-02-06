import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { DetailService } from '../../services/detail.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-delete-detail-modal',
  templateUrl: './delete-detail-modal.page.html',
  styleUrls: ['./delete-detail-modal.page.scss'],
})
export class DeleteDetailModalPage implements OnInit {

  @Input() detail: any;
  

  constructor(
    private modalController: ModalController,
    private detailService: DetailService,
    private router: Router

  ) {
    
  }

  async deleteDetail() {
    const success = await this.detailService.deleteDetail(this.detail.id);

    console.log ('success', success);
    
    if (success) {
      this.dismissModal(true); // Reload details on success

      // Navigate to /villes-commerces after deleting the product
      // this.router.navigate(['/villes-commerces']);
    }
  }
 
  dismissModal(reload: boolean = false) {
    this.modalController.dismiss({
      reload: reload
    });
  }

  ngOnInit() {
    console.log ('detail', this.detail)
  }
}
