import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommerceService } from 'src/app/services/commerce.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-commerce-categories',
  templateUrl: './commerce-categories.page.html',
  styleUrls: ['./commerce-categories.page.scss'],
})
export class CommerceCategoriesPage implements OnInit {

  commerceId!: number;
  commerceInfo: any = {};
  categories: any[] = [];

  constructor(
    private commerceService: CommerceService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    // Retrieve the commerceId from the route parameters
    this.route.params.subscribe(params => {
      this.commerceId = +params['id'];
      // Load commerce information and categories 
      this.loadCommerceInfo();
      this.loadCategories();
    });
  }

  async loadCommerceInfo() {
    try {
      // Retrieve commerce information based on commerceId
      this.commerceInfo = await this.commerceService.getCommerceById(this.commerceId);

      // Additional information retrieval if needed
      if (this.commerceInfo) {
        // Retrieve business owner information
        const businessOwnerInfo = await this.commerceService.getBusinessOwnerByCommerceBusinessOwnerId(this.commerceInfo.business_owner_id);

        if (businessOwnerInfo) {
          // Add business owner information to commerceInfo
          this.commerceInfo.businessOwnerName = businessOwnerInfo.name;
          this.commerceInfo.businessOwnerPhone1 = businessOwnerInfo.telephone1;
          this.commerceInfo.businessOwnerPhone2 = businessOwnerInfo.telephone2;
          this.commerceInfo.businessOwnerAdresse = businessOwnerInfo.adresse;
          this.commerceInfo.monthlyFeePaid = businessOwnerInfo.monthly_fee_paid;
        }

        // Retrieve ville information
        const villeName = await this.commerceService.getVilleNameByVilleId(this.commerceInfo.ville_id);

        if (villeName) {
          // Add ville information to commerceInfo
          this.commerceInfo.villeName = villeName;
        }
      }
    } catch (error) {
      console.error('Error loading commerce information:', error);
    }
  }

  async loadCategories() {
    try {
      // Retrieve categories based on commerceId
      this.categories = await this.commerceService.getCategoriesByCommerceId(this.commerceId);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  openCategory(categoryId: string) {
    // Navigate to CategoryProductsPage with the selected category ID
    this.router.navigate(['/category-products', categoryId]);
  }
} 
