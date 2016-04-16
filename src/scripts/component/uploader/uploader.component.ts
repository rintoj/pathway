import {Config} from '../../state/config';
import {DialogBox} from '../../directive/dialog/dialog-box';
import {RestService} from '../../service/rest.service';
import {LoaderComponent} from '../loader/loader.component';
import {Component, View, Input, Output, EventEmitter} from 'angular2/core';

enum UploadStatus { UPLOADING, UPLOADED, UPLOAD_FAILED, CLEARING, CLEARED, CLEAR_FAILED, DEFAULT };

@Component({
  selector: 'pw-uploader',
  providers: [RestService]
})
@View({
  directives: [DialogBox, LoaderComponent],
  template: `
		<dialog-box [title]="'Data Setup Wizard'" [showTitle]="true" [show]="show" (autoHide)="onAutoHide()">
				<div class="dialog-message" [ngSwitch]="status">
		      <span *ngSwitchWhen="0">
						<pw-loader></pw-loader>
						<div class="status-message"> Uploading sample data... Please wait. </div>
					</span>

		      <span *ngSwitchWhen="1">
						<div class="status-message">
							<i class="fa fa-check"></i> Sample data uploaded.
						</div>
						Hit <b> <a href="{{dataEndpoint}}" target="_blank"> {{dataEndpoint}}</a></b> to see them.
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
						<a href="{{dataEndpoint}}" target="_blank">
							{{dataEndpoint}}</a></b> should return an empty array.
					</span>

					<span *ngSwitchWhen="5">
						<div class="status-message error-message">
							<i class="fa fa-exclamation-triangle"></i> Could not clear data due to an error!
						</div>
						Accessing <b>
						<a href="{{dataEndpoint}}" target="_blank">{{dataEndpoint}}</a></b> should return <span class="code">404</span>
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
		</dialog-box>
	`
})
export class UploaderComponent {

  @Input() show: boolean;
  @Output() autoHide = new EventEmitter();
  private status: UploadStatus = UploadStatus.DEFAULT;

  // TODO: Review this logic
  serverUrl: string = ''; // Config.SERVICE_URL;
  dataEndpoint: string = ''; // Config.SERVICE_URL + '/projectlog';

  sampleDataUrl: string = Config.DATA_PROJECTLOGS_URL;

  constructor(private service: RestService) {
    this.show = true;
  }

  private partition(items: Array<any>, size: number): any[] {
    var p = [];
    for (var i = Math.floor(items.length / size); i-- > 0;) {
      p[i] = items.slice(i * size, (i + 1) * size);
    }
    return p;
  }

  upload() {
    this.status = UploadStatus.UPLOADING;
    this.service.fetch(this.sampleDataUrl)
      .map((res: any) => res.json())
      .flatMap((data: any): any => this.partition(data, 100))
      .subscribe((data: any[]) => {
        console.log(data);
        this.service.createOrUpdate(this.dataEndpoint, data)
          .subscribe(() => this.status = UploadStatus.UPLOADED, () => this.status = UploadStatus.UPLOAD_FAILED);
      }, () => this.status = UploadStatus.UPLOAD_FAILED);
  }

  clear() {
    this.status = UploadStatus.CLEARING;
    this.service.delete(this.dataEndpoint)
      .subscribe(() => this.status = UploadStatus.CLEARED, () => this.status = UploadStatus.CLEAR_FAILED);
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
