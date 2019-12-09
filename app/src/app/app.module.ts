import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PredictionComponent } from './prediction/prediction.component';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
  declarations: [
    AppComponent,
    PredictionComponent
  ],
  imports: [
    BrowserModule,
    WebcamModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
