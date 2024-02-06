import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule


import { IonicModule } from '@ionic/angular';

import { EnterCustomValuesModalPageRoutingModule } from './enter-custom-values-modal-routing.module';

import { EnterCustomValuesModalPage } from './enter-custom-values-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule, 
    EnterCustomValuesModalPageRoutingModule
  ],
  declarations: [EnterCustomValuesModalPage]
})
export class EnterCustomValuesModalPageModule {}
