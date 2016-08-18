import { Page } from 'ionic-angular';
import {Component} from "@angular/core";
import {FormBuilder, ControlGroup, Validators, AbstractControl } from '@angular/common';
import {NavController, LoadingController, ToastController, ViewController,ModalController, Platform, Storage, SqlStorage} from 'ionic-angular';
import {EventRegService} from '../../providers/event-reg-service/event-reg-service';
import {StudentInfoService} from '../../providers/student-info-service/student-info-service';
import {GlobalOverlayProvider} from '../../providers/global-overlay-provider/global-overlay-provider';
import {GlobalObjectProvider} from '../../providers/global-object-provider/global-object-provider';
import {Http, Headers} from '@angular/http';
import {ErrorHandler} from '../../providers/error-handler/error-handler';
import {ModalsContentPage} from '../home/home';


@Component({
  templateUrl: 'build/pages/register/register.html',
  providers: [EventRegService]
})
export class EventRegPage {
  data: any;
  public events: any;
  platform: Platform;
  http: Http;
  student: any;
  storage: Storage;
  formValues: String;
  loading: any;

  studentForm: ControlGroup;

  firstName: AbstractControl;
  lastName: AbstractControl;
  email: AbstractControl;
  phone: AbstractControl;
  year: AbstractControl;
  gender: AbstractControl;

  constructor(private nav: NavController, public eventRegService: EventRegService, public studentInfoService: StudentInfoService, platform: Platform, builder: FormBuilder, http: Http, public viewCtrl: ViewController, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public modalCtrl: ModalController, public globalOverlayProvider: GlobalOverlayProvider, public errorHandler: ErrorHandler, public globalObjectProvider: GlobalObjectProvider) {
    this.http = http;
    this.data = null;
    this.platform = platform;
    this.student = [];
    this.platform.ready().then(() => {
      this.storage = new Storage(SqlStorage);
    });

    //  this.loadStudentInfo();// Pull the student info out of the database right off the bat and store it in a variable
  }

  ngOnInit() {
    //called after the constructor and called  after the first ngOnChanges()
    this.globalOverlayProvider.presentLoadingMessage("Loading Events...");
    this.loadEvents();
  }

  doRefresh() {
    this.globalOverlayProvider.presentLoadingMessage("Loading Events...");
    this.loadEvents();
    // this.nav.setRoot(EventRegPage);
  }

  openModal() {
    let modal = this.modalCtrl.create(ModalsContentPage);
    modal.present();
  }


  loadEvents() {
    var now = new Date();
    var tempDate;
    this.eventRegService.load()
      .then(data => {
        console.log(data);
        data.sort(this.comp);
        console.log(data);

        this.events = data
          .filter((postData) => {
            tempDate = new Date(postData.acf.event_date).getTime();
            if (tempDate < now) {
              return false;
            } else {
              return true;
            }
          })
          .map((postData) => {
            return {
              title: postData.acf.event_title,
              desc: postData.acf.event_description,
              imageURL: postData.acf.event_image,
              startDate: postData.acf.event_date,
              id: postData.id
            }
          });
        console.log(this.events);
        this.globalOverlayProvider.dismissLoading();
      }, (error) => {
        //if contains Error: timeout, handle
        console.log(error)
        this.globalOverlayProvider.dismissLoading();
      });
  }

  presentToastMessage(toastMessage) {
    let toast = this.toastCtrl.create({
      message: toastMessage,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
      this.dismissModal();
    });

    toast.present();
  }

  dismissModal() {
    this.viewCtrl.dismiss();
  }


  submitToSheet(eventTitle, eventID) {
    //this.loadStudentInfo();
    this.globalOverlayProvider.presentLoadingMessage("Submitting entry...");
    var student = this.studentInfoService.getGlobalStudentInfo();
    var values = "First Name=" + student.firstName +
      "&Last Name=" + student.lastName +
      "&Email=" + student.emailAddress +
      "&Mobile=" + student.phoneNumber +
      "&Year In School=" + student.yearInSchool +
      "&Gender=" + student.gender +
      "&Event=" + eventTitle;

    var url = "https://script.google.com/macros/s/AKfycbzXE56xfKqseHAIcdtWpR2d1H5xZB-VpaFf9XZW6nUpF8x1rEM/exec";

    this.http.get(url + '?' + values)
      .timeout(35000)
      .map(res => res.json())
      .subscribe(
      (data) => {
        console.log(data);
        this.handleSubmissionResponse(data, eventID);
      },
      (err) => {
        console.log(err);
        this.globalOverlayProvider.dismissLoading();
        this.errorHandler.handleHTTPError(err);
      } // Reach here if fails
      );
  }


  handleSubmissionResponse(data, eventID) {
    this.globalOverlayProvider.dismissLoading();

    if (data.result == "success") {
      setTimeout(() => { // Temporary hack since beta 11 won't dismiss the loading overlay when toast pops
        this.presentToastMessage("Your registration has been successfully submitted!");
      }, 2000);

      this.studentInfoService.appendEventID(eventID);
    } else {
      this.globalOverlayProvider.presentErrorAlertMessage("There was a problem with your submission. Try again, will ya? If the problem keeps up, yell at Phil Lopez or just give up and pray about it :)");
    }
  }

  isNotRegistered(eventID) {
    var eventsArray = [];
    if (this.isSudentProfileBlank()) {
      return false;
    } else {
      var tempStudentInfo = this.studentInfoService.getGlobalStudentInfo();

      if (!Array.isArray(tempStudentInfo.registeredEvents)) {
        eventsArray = tempStudentInfo.registeredEvents.split(",");
      } else {
        eventsArray = tempStudentInfo.registeredEvents;
      }
    }

    if (eventsArray.indexOf(eventID.toString()) < 0) {
      return true;
    } else {
      return false;
    }
  }

  isSudentProfileBlank() {
    if (this.studentInfoService.getGlobalStudentInfo() == "") {
      return true;
    } else {
      return false;
    }
  }

  formatDateDisplay(event) {
    var month = event.startDate.substring(0, 2);
    var day = event.startDate.substring(3, 5);
    var year = event.startDate.substring(6, 10);
    var value = this.globalObjectProvider.monthString(month) + " " + day + ", " + year;
    return value;
  }

  comp(a, b) {
    return new Date(a.acf.event_date).getTime() - new Date(b.acf.event_date).getTime();
  }

}


@Component({
  templateUrl: './build/pages/modals/profile-alert.html',
  providers: []
})
export class ProfileAlertModalPage {

  platform: Platform;
  http: Http;
  public student: any; // This is the object used on the page
  public genderList: any;
  public yearInSchoolList: any;
  storage: Storage;
  formValues: String;


  studentForm: ControlGroup;
  formBuilder: FormBuilder;

  firstName: AbstractControl;
  lastName: AbstractControl;
  emailAddress: AbstractControl;
  phoneNumber: AbstractControl;
  yearInSchool: AbstractControl;
  gender: AbstractControl;


  constructor(private nav: NavController, private studentInfoService: StudentInfoService, public viewCtrl: ViewController) {
  }

  ngOnInit() {

  }

  dismissModal() {
    this.viewCtrl.dismiss();
  }



}
