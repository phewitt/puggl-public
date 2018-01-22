import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {MatDialog} from "@angular/material";
import {LoadingDialogComponent} from "../dialogs/loading-dialog/loading-dialog.component";

@Injectable()
export class LoadingServiceProvider {
  spinner: any;

  constructor(
    public dialog: MatDialog
  ) {}

  showLoading() {
    this.dialog.open(LoadingDialogComponent, {
      height: '130px',
      width: '130px',
      disableClose: false
    });
  }

  hideLoading() {
      this.dialog.closeAll();
  }
}
