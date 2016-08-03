import { Page } from 'ionic-angular';
import {Component} from "@angular/core";
import {FormBuilder, ControlGroup, Validators, AbstractControl } from '@angular/common';
import {NavController, Loading, Platform, Storage, SqlStorage} from 'ionic-angular';
import {EventRegService} from '../../providers/event-reg-service/event-reg-service';
import {Http, Headers} from '@angular/http';


@Component({
  templateUrl: 'build/pages/register/register.html',
  providers: [EventRegService],
})
export class EventRegPage {
    public events: any;
    platform: Platform;
    http: Http;
    student: any;
    storage: Storage;
    formValues: String;

    studentForm: ControlGroup;

    firstName: AbstractControl;
    lastName: AbstractControl;
    email: AbstractControl;
    phone: AbstractControl;
    year: AbstractControl;
    gender: AbstractControl;

    constructor(private nav: NavController, public eventRegService: EventRegService, platform: Platform, builder: FormBuilder, http: Http) {
        this.http = http;
        this.platform = platform;
        this.student = [];
        this.platform.ready().then(() => {
            this.storage = new Storage(SqlStorage);
        });
        this.presentLoadingDefault();
          this.loadEvents();
          this.loadStudentInfo();// Pull the student info out of the database right off the bat and store it in a variable
    }

    presentLoadingDefault() {
        let loading = Loading.create({
            content: 'Please wait...'
        });

        this.nav.present(loading);

        setTimeout(() => {
            loading.dismiss();
        }, 5000);
    }

    doRefresh(refresher) {
        this.loadEvents();

        setTimeout(() => {
            console.log('Refresh: Async operation has ended');
            refresher.complete();
        }, 2000);
    }

    loadEvents(){
      this.eventRegService.load()
      .then(data => {
        console.log(data);
        this.events = data.map(function(postData) {
            // The .map lets me take the original data and map it to the format the audio player wants
                    return {
                      title: postData.acf.event_title,
                      desc: postData.acf.event_description,
                      imageURL:  postData.acf.event_image,
                    }
               });
        console.log(this.events);
      });
    }


    loadStudentInfo() {
        var values = null;
        this.platform.ready().then(() => {
            this.storage.query("SELECT * FROM student").then((data) => {
                this.student = [];
                if (data.res.rows.length > 0) {
                    for (var i = 0; i < data.res.rows.length; i++) {
                        this.student.push({ firstname: data.res.rows.item(i).firstname, lastname: data.res.rows.item(i).lastname, email: data.res.rows.item(i).email, phone: data.res.rows.item(i).phone });

                        values = "First Name=" + data.res.rows.item(i).firstname +
                            "&Last Name=" + data.res.rows.item(i).lastname +
                            "&Email=" + data.res.rows.item(i).email +
                            "&Mobile=" + data.res.rows.item(i).phone +
                            "&Year In School=" + data.res.rows.item(i).year +
                            "&Gender=" + data.res.rows.item(i).gender;
                        this.formValues = values;
                    }
                }
            }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error.err));
            });
        });
    }

    submitToSheet(eventTitle) {
        var values = this.formValues;
        values += "&Event=" + eventTitle;
        var url = "https://script.google.com/macros/s/AKfycbzXE56xfKqseHAIcdtWpR2d1H5xZB-VpaFf9XZW6nUpF8x1rEM/exec";

        // var headers = new Headers();
        // headers.append('Content-Type', 'application/json; charset=utf-8');
        // this.http.post('https://script.google.com/macros/s/AKfycbzXE56xfKqseHAIcdtWpR2d1H5xZB-VpaFf9XZW6nUpF8x1rEM/exec', values, {
        //    headers: headers
        //    })
        //    .map(res => res.json())
        //    .subscribe(
        //     // data => this.saveJwt(data.id_token),
        //      err => this.logError(err),
        //      () => console.log('Authentication Complete')
        //    );
        console.log("url: " + url);
        console.log("values: " + values);
        this.http.get(url + '?' + values)
            .map(res => res.text())
            .subscribe(
            // data => this.randomQuote = data,
            err => this.logError(err),
            () => console.log('Success')
            );
    }



    logError(err) {
        console.error('There was an error: ' + err);
    }

}
