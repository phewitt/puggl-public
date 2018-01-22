import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FirebaseService} from "../../providers/firebase.service";
import {LoadingServiceProvider} from "../../providers/loading-service";
import {EmailList} from "../../models/email-list";

@Component({
  selector: 'app-email-list-edit',
  templateUrl: './email-list-edit.component.html',
  styleUrls: ['./email-list-edit.component.scss']
})
export class EmailListEditComponent implements OnInit {
  emailListKey:string;
  isNew = false;

  constructor(
    private route: ActivatedRoute,
    public fb: FirebaseService,
    private loading: LoadingServiceProvider,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.emailListKey = params['emailListKey'];

      if(this.emailListKey == 'new') {
        this.isNew = true;
        this.fb.emailList = new EmailList();
      }
      else {
        this.fb.emailList = new EmailList();
        this.isNew = false;
        this.fb.getEmailList(this.emailListKey).snapshotChanges().map(a => {
          const data = a.payload.data();
          const id = a.payload.id;
          return {id, ...data};
        }).subscribe((emailList: any) => {
          this.fb.emailList = emailList;
          console.log(this.fb.emailList)
        });
      }
    });
  }

  saveEmailList() {
    this.loading.showLoading();
    let list = JSON.parse(JSON.stringify(this.fb.emailList));
    list.dateCreated = this.fb.emailList.dateCreated;
    list.dateUpdated = this.fb.emailList.dateUpdated;
    this.fb.addEmailList(list).then((rt) => {
      this.fb.openSnackBar('Email List saved Successfully');
      this.loading.hideLoading();
      this.router.navigate(['/email-lists/'+rt.id]);
    })
      .catch((e) => {
        this.loading.hideLoading();
        this.fb.openSnackBar('Error');
      });
  }

  updateEmailList() {
    this.loading.showLoading();
    this.fb.emailList.dateUpdated = new Date();
    let list = JSON.parse(JSON.stringify(this.fb.emailList));
    list.dateCreated = new Date(this.fb.emailList.dateCreated);
    list.dateUpdated = this.fb.emailList.dateUpdated;
    this.fb.updateEmailList(list).then((rt) => {
      this.fb.openSnackBar('Email List saved Successfully');
      this.loading.hideLoading();
    })
      .catch((e) => {
        this.loading.hideLoading();
        this.fb.openSnackBar('Error');
      });
  }

}
