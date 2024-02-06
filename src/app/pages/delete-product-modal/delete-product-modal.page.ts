import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-delete-product-modal',
  templateUrl: './delete-product-modal.page.html',
  styleUrls: ['./delete-product-modal.page.scss'],
})
export class DeleteProductModalPage implements OnInit {

  @Input() product: any;
 
  constructor(
    private modalController: ModalController,
    private productService: ProductService,
    private navParams: NavParams,
    private router: Router
  ) {
    
  } 

  async deleteProduct() {
    const success = await this.productService.deleteProduct(this.product.id);

    if (success) {
      this.dismissModal(true); // Reload products on success

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
  }

}
