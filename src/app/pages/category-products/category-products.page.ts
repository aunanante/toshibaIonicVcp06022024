import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-category-products',
  templateUrl: './category-products.page.html',
  styleUrls: ['./category-products.page.scss'],
})
export class CategoryProductsPage implements OnInit {

  
  categoryInfo: any = {};
  products: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private navCtrl: NavController, 
  ) {}

  ngOnInit() {
    // Retrieve the category ID from the route parameters
    this.route.params.subscribe(params => {
      const categoryId = params['id'];
      // Load category information and products
      this.loadCategoryInfo(categoryId);
      this.loadProducts(categoryId);
    });
  }

  async loadCategoryInfo(categoryId: string) {
    try {
      // Retrieve category information based on categoryId
      this.categoryInfo = await this.categoryService.getCategoryByCategoryId(categoryId);
    } catch (error) {
      console.error('Error loading category information:', error);
    }
  }

  async loadProducts(categoryId: string) {
    try {
      // Retrieve products based on categoryId
      this.products = await this.categoryService.getProductsByCategoryId(categoryId);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  // Method to navigate back to the previous page
  goBack() {
    // Adjust the navigation path based on your route configuration
    this.router.navigate(['/commerce-categories', this.categoryInfo.commerce_id]);
  }

  // Method to navigate to product details page
  viewProductDetails(productId: number) {
    // Adjust the navigation path based on your route configuration
    this.navCtrl.navigateForward(['/product-details', productId]);
  }

  

}
 