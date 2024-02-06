import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdateCommerceModalPageRoutingModule } from './update-commerce-modal-routing.module';

import { UpdateCommerceModalPage } from './update-commerce-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdateCommerceModalPageRoutingModule
  ],
  declarations: [UpdateCommerceModalPage]
})
export class UpdateCommerceModalPageModule {}
