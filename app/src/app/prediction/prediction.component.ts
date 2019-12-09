import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as coco from '@tensorflow-models/coco-ssd';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { PredictionType } from '../../model/prediction-type';
import { PredictionResult } from '../../model/prediction-result';
import { Prediction } from '../../model/prediction';

import confetti from 'canvas-confetti';

const FONT = '16px open-sans';
const COLOR = '#0074df';
const SNAPSHOT_INTERVAL = 500;

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.scss']
})
export class PredictionComponent implements OnInit {

  @Input() predictionThreshold: number;
  @Input() objectToPredict: PredictionType;
  @Input() isStopOnObjectFoundEnabled = false; // When true, this stops the algorithm if a valid result is found
  @Input() isConfettiEnabled = false;
  @Output() predictionChange = new EventEmitter<PredictionResult[]>();
  @ViewChild('canvas', {read: ElementRef, static: false}) canvas: ElementRef<any>;
  webcamImage: WebcamImage;
  predictions: Prediction[] = [];

  private trigger: Subject<void> = new Subject<void>();
  private model: any;
  private found = false;

  ngOnInit(): void {
    // For debugging purposes
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => console.log('Detected devices:', mediaDevices));

    // Load CocoSsd model
    coco.load()
      .then(model => this.model = model)
      .catch(err => console.log('Cannot load model', err));

    // Render predictions for snapshots, based on the provided model
    this.trigger.subscribe(() => {
      if (this.webcamImage && this.webcamImage.imageData && this.model) {
        this.model.detect(this.webcamImage.imageData)
          .then(predictions => {
            this.renderPredictions(predictions);
            this.predictions = predictions;

            const results = this.mapPredictionsToResults(predictions);
            this.emitResults(results);
            this.markFound(results);
          });
      }
    });

    // Snapshot interval
    setInterval(() => this.trigger.next(), SNAPSHOT_INTERVAL);
  }

  error(error: WebcamInitError): void {
    console.error('Cannot initialize:', error);
  }

  capture(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  /**
   * Method for mark object as found. Can be used
   * if the algorithm must be stopped from detecting
   * new objects.
   * @param results
   */
  private markFound(results): void {
    if (!this.found && this.isStopOnObjectFoundEnabled) {
      this.found = results.find(res => res.correct) !== undefined;

      if (this.found && this.isConfettiEnabled) {
        this.showConfetti();
      }
    }
  }

  /**
   * Because it is always fun to show some confetti.
   */
  private showConfetti(): void {
    const myConfetti = confetti.create(this.canvas.nativeElement, { resize: true });
    myConfetti({
      particleCount: 400,
      spread: 200
    });
  }

  /**
   * Emit prediction results to listeners.
   * @param results
   */
  private emitResults(results): void {
    if (!this.found) {
      console.log('prediction', results);
      this.predictionChange.emit(results);
    }
  }

  private mapPredictionsToResults(predictions): PredictionResult[] {
    return predictions.map(p => (
      {
        correct: p.score > this.predictionThreshold
          && p.class === this.objectToPredict,
        object: p.class,
        certainty: p.score
      }
    ));
  }

  private renderPredictions(predictions: any): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = FONT;
    ctx.textBaseline = 'top';

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];

      ctx.strokeStyle = COLOR;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    });
  }
}
