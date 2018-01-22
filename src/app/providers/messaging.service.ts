import { Injectable }          from '@angular/core';
import { AngularFireAuth }     from 'angularfire2/auth';
import * as firebase from 'firebase';
import 'rxjs/add/operator/take';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import {AngularFirestore} from "angularfire2/firestore";


@Injectable()
export class MessagingService {
  messaging = firebase.messaging();
  currentMessage = new BehaviorSubject(null);

  constructor(
    public fs: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  updateToken(token) {
    this.afAuth.authState.take(1).subscribe(user => {
      if (!user) return;
      const data = { [user.uid]: token }
      this.fs.doc(`fcm_tokens/${user.uid}`).set(data)
    })
  }

  getPermission() {
    this.messaging.requestPermission()
      .then(() => {
        // console.log('Notification permission granted.');
        return this.messaging.getToken()
      })
      .then(token => {
        // console.log('token:', token)
        this.updateToken(token)
      })
      .catch((err) => {
        console.log('Unable to get permission to notify.', err);
      });
  }

  receiveMessage() {
    this.messaging.onMessage((payload) => {
      // console.log("Message received. ", payload);
      this.currentMessage.next(payload)
    });
  }
}
