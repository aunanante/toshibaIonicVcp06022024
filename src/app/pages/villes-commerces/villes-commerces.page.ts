import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommerceService } from 'src/app/services/commerce.service';
import { NavController } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonSelect } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { VillesModalPage } from '../villes-modal/villes-modal.page';
import { ChangeDetectorRef } from '@angular/core';





@Component({
  selector: 'app-villes-commerces',
  templateUrl: './villes-commerces.page.html',
  styleUrls: ['./villes-commerces.page.scss'],
})

export class VillesCommercesPage implements OnInit {

  villes: any[] = [];
  commerces: any[] = [];
  selectedVilleId: number | null = null;
  showSelectWithVille: boolean = true;

  constructor(
    private router: Router,
    private userService: UserService,
    private commerceService: CommerceService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.fetchAndEnhanceCommerces();
  }

  async fetchAndEnhanceCommerces() {
    try {
      // Fetch commerces
      this.commerces = await this.commerceService.getAllCommercesBelongingOwnersWithMonthlyFeePaid();

      // Enhance commerces array with villeName
      for (const commerce of this.commerces) {
        commerce.villeName = await this.commerceService.getVilleNameByVilleId(commerce.ville_id);
      }
    } catch (error) {
      console.error('Error fetching and enhancing commerces:', error);
    }
  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }

  async search(event: CustomEvent) {
    const query: string = event?.detail?.value || '';

    try {
      // If a search query is provided, filter commerces
      if (query.trim() !== '') {
        this.commerces = await this.commerceService.searchCommerces(query);
        // Enhance the filtered commerces array with villeName
        for (const commerce of this.commerces) {
          commerce.villeName = await this.commerceService.getVilleNameByVilleId(commerce.ville_id);
        }
      } else {
        // If no search query, fetch and enhance all commerces
        await this.fetchAndEnhanceCommerces();
      }
    } catch (error) {
      console.error('Error searching commerces:', error);
    }
  }

  async filterByVilleId(villeId: number) {
    try {
      // Filter commerces by villeId
      this.commerces = await this.commerceService.getCommercesByVilleId(villeId);

      // Enhance the filtered commerces array with villeName
      for (const commerce of this.commerces) {
        commerce.villeName = await this.commerceService.getVilleNameByVilleId(commerce.ville_id);
      }
    } catch (error) {
      console.error('Error filtering commerces by villeId:', error);
    }
  }

  async clearFilter() {
    try {
      // Clear the filter and fetch and enhance all commerces
      await this.fetchAndEnhanceCommerces();

      // Reset the selected value in the ion-select
      this.selectedVilleId = null;

      // Toggle the rendering of ion-select
      this.showSelectWithVille = true;
    } catch (error) {
      console.error('Error clearing filter:', error);
    }
  }

  async openVillesModalPage() {
    const villesList = await this.commerceService.getAllVilles();

    const modal = await this.modalCtrl.create({
      component: VillesModalPage,
      componentProps: {
        villesList: villesList, // Pass the list of villes to the modal
      },
    });

    modal.onDidDismiss().then((result) => {
      // Handle the result from the modal if needed
      if (result.data) {
        // Handle the selected ville
        this.filterByVilleId(result.data);
      }
    });

    return await modal.present();
  }

  navigateToCommerceCategories(commerceId: number) {
    this.router.navigate(['/commerce-categories', commerceId]);
  }
  


}
