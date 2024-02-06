import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdateCategoryModalPageRoutingModule } from './update-category-modal-routing.module';

import { UpdateCategoryModalPage } from './update-category-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdateCategoryModalPageRoutingModule
  ],
  declarations: [UpdateCategoryModalPage]
})
export class UpdateCategoryModalPageModule {}
