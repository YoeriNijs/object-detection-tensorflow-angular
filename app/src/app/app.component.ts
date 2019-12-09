import { Component } from '@angular/core';
import { PredictionConfig } from '../model/prediction-config';
import { PredictionResult } from '../model/prediction-result';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  data: PredictionConfig = {
    objectToDetect: 'person',
    threshold: 0.7,
    quitOnFound: false,
    showConfettiWhenFound: true
  };

  results: PredictionResult[] = [];

  handlePredictionChange(results: PredictionResult[]): void {
    this.results = results;
  }
}
