import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdateProductModalPageRoutingModule } from './update-product-modal-routing.module';

import { UpdateProductModalPage } from './update-product-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdateProductModalPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [UpdateProductModalPage]
})
export class UpdateProductModalPageModule {}
