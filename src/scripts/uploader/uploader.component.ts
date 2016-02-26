import {Component, View, Input, Output, EventEmitter} from 'angular2/core';
import {DialogComponent} from '../dialog/dialog.component';
import {LoaderComponent} from '../loader/loader.component';
import {BulkRestService} from '../shared/services/bulk-rest.service';

enum UploadStatus { UPLOADING, UPLOADED, UPLOAD_FAILED, CLEARING, CLEARED, CLEAR_FAILED, DEFAULT };

@Component({
  selector: 'pw-uploader',
  providers: [BulkRestService]
})
@View({
  directives: [DialogComponent, LoaderComponent],
  template: `
		<pw-dialog [title]="'Data Setup Wizard'" [showTitle]="true" [show]="show" (autoHide)="onAutoHide()">
				<div class="dialog-message" [ngSwitch]="status">
		      <span *ngSwitchWhen="0">
						<pw-loader></pw-loader>
						<div class="status-message"> Uploading sample data... Please wait. </div>
					</span>

		      <span *ngSwitchWhen="1">
						<div class="status-message">
							<i class="fa fa-check"></i> Sample data uploaded.
						</div>
						Hit <b> <a href="{{searchUrl}}" target="_blank"> {{searchUrl}}</a></b> to see them.
					</span>

					<span *ngSwitchWhen="2">
						<div class="status-message error-message">
							<i class="fa fa-exclamation-triangle"></i>
								Upload failed due to an unknown error!
						</div>
						Please try again later. Make sure elasticsearch is running, 
						<b><a href="{{serverUrl}}" target="_blank">{{serverUrl}}</a></b> and
						<b><a href="{{sampleDataUrl}}" target="_blank">{{sampleDataUrl}}</a></b> are accessible!
					</span>

					<span *ngSwitchWhen="3">
						<pw-loader></pw-loader>
						<div class="status-message"> Clearing sample data... Please wait. </div>
					</span>

		      <span *ngSwitchWhen="4">
						<div class="status-message">
					 		<i class="fa fa-check"></i> Data cleared.
						</div>
						 Accessing <b>
						<a href="{{searchUrl}}" target="_blank">
							{{searchUrl}}</a></b> should return <span class="code">404</span> now.
					</span>

					<span *ngSwitchWhen="5">
						<div class="status-message error-message">
							<i class="fa fa-exclamation-triangle"></i> Could not clear data due to an error!
						</div>
						Accessing <b>
						<a href="{{searchUrl}}" target="_blank">{{searchUrl}}</a></b> should return <span class="code">404</span>
						if data was cleared or was never created.
					</span>

		      <span *ngSwitchDefault>
						<ul>
							<li>
								Click on <b>Upload</b> button to load sample data into elasticsearch db. Make sure elasticsearch is
								running, <b><a href="{{serverUrl}}" target="_blank">{{serverUrl}}</a></b> is accessible,
								and sample data avaiable at <b><a href="{{sampleDataUrl}}" target="_blank">{{sampleDataUrl}}</a></b><br>
							</li>
							<li>
								Click on <b>Clear</b> button to clear all the data from elasticsearch db.
								You can use this option for a fresh start
							</li>
						</ul>
					</span>
				</div>

				<div class="dialog-footer">
					<div class="btn btn-pill"
							[class.btn-disabled]="status === 0 || status === 3"
							(click)="upload()">
						<i class="fa fa-upload"></i> Upload
					</div>
					<div class="btn btn-pill btn-primary"
							[class.btn-disabled]="status === 0 || status === 3"
							(click)="clear()">
						<i class="fa fa-trash"></i> Clear
					</div>
					<div class="btn btn-pill" (click)="close()">
						<i class="fa fa-times"></i> Close
					</div>
				</div>
		</pw-dialog>
	`
})
export class UploaderComponent {

  @Input() show: boolean;
  @Output() autoHide = new EventEmitter();
  private status: UploadStatus = UploadStatus.DEFAULT;

  serverUrl: string = 'http://localhost:9200';
  searchUrl: string = this.serverUrl + '/pathway/projectlog/_search';
  sampleDataUrl: string = 'http://localhost:8080/sample-data.json';

  constructor(private bulkService: BulkRestService) {
    this.show = true;
  }

  upload() {
    this.status = UploadStatus.UPLOADING;
    this.bulkService.uploadSampleData((success: boolean) => {
      this.status = success ? UploadStatus.UPLOADED : UploadStatus.UPLOAD_FAILED;
    });
  }

  clear() {
    this.status = UploadStatus.CLEARING;
    this.bulkService.clearData((success: boolean) => {
      this.status = success ? UploadStatus.CLEARED : UploadStatus.CLEAR_FAILED;
    });
  }

  close() {
    this.status = UploadStatus.DEFAULT;
    this.show = false;
    this.autoHide.next(this.show);
  }

  onAutoHide() {
    this.status = UploadStatus.DEFAULT;
    this.show = false;
    this.autoHide.next(this.show);
  }
}
