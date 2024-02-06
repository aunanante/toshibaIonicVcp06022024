import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';


@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements OnInit {
  product: any = {};
  details: any[] = []; // Array to store details related to the product


  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    // Retrieve the product ID from the route parameters
    this.route.params.subscribe(params => {
      const productId = params['id'];
      // Load product details
      this.loadProductDetails(productId);
    });
  }

  async loadProductDetails(productId: number) {
    try {
      // Retrieve product details using the new method
      this.product = await this.productService.getProductByProductId(productId);
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  }

  async loadDetails(productId: number) {
    try {
      // Retrieve details related to the current product using the DetailsService
      this.details = await this.productService.getDetailsByProductId(productId);
    } catch (error) {
      console.error('Error loading details:', error);
    }
  }
 
}
