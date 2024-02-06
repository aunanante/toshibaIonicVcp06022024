import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommerceModalPageRoutingModule } from './commerce-modal-routing.module';

import { CommerceModalPage } from './commerce-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommerceModalPageRoutingModule
  ],
  declarations: [CommerceModalPage]
})
export class CommerceModalPageModule {}
