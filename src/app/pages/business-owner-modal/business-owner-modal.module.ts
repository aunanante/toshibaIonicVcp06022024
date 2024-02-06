import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BusinessOwnerModalPageRoutingModule } from './business-owner-modal-routing.module';

import { BusinessOwnerModalPage } from './business-owner-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BusinessOwnerModalPageRoutingModule
  ],
  declarations: [BusinessOwnerModalPage]
})
export class BusinessOwnerModalPageModule {}
