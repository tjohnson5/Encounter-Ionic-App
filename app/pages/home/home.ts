import {Component} from "@angular/core";
import {FormBuilder, ControlGroup, Validators, AbstractControl } from '@angular/common';
import {NavController, NavParams, Toast, ViewController, Platform, Storage, SqlStorage, Modal} from 'ionic-angular';
import {EventsPage} from '../events/events';
import {PodcastPage} from '../podcast/podcast';
import {Http, Headers} from '@angular/http';

@Component({
    templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
    platform: Platform;
    http: Http;
    student: any;
    storage: Storage;
    formValues: String;

    constructor(private nav: NavController) {
        this.nav = nav;
    }
    openModal() {
        let modal = Modal.create(ModalsContentPage);
        this.nav.present(modal);
    }
}


@Component({
    templateUrl: './build/pages/modals/info.html'
})
export class ModalsContentPage {

    platform: Platform;
    http: Http;
    public student: any;
    storage: Storage;
    formValues: String;

    studentForm: ControlGroup;

    firstName: AbstractControl;
    lastName: AbstractControl;
    email: AbstractControl;
    phone: AbstractControl;
    year: AbstractControl;
    gender: AbstractControl;


    constructor(private nav: NavController, platform: Platform, builder: FormBuilder, http: Http, public viewCtrl: ViewController,  public navParams: NavParams) {
        this.student = {};
        this.http = http;
        this.nav = nav;
        this.platform = platform;
        this.platform.ready().then(() => {
            this.storage = new Storage(SqlStorage);
        });

        this.studentForm = builder.group({
            'firstName': ['', Validators.compose([Validators.required])],
            'lastName': ['', Validators.compose([Validators.required])],
            'emailAddress': ['', Validators.compose([Validators.required])],
            'phoneNumber': ['', Validators.compose([Validators.required])],
            'yearInSchool': ['', Validators.compose([Validators.required])],
            'gender': ['', Validators.compose([Validators.required])]
        });

        this.firstName = this.studentForm.controls['firstName'];
        this.lastName = this.studentForm.controls['lastName'];
        this.email = this.studentForm.controls['emailAddress'];
        this.phone = this.studentForm.controls['phoneNumber'];
        this.year = this.studentForm.controls['yearInSchool'];
        this.gender = this.studentForm.controls['gender'];

        this.loadStudentInfo();

    }

    loadStudentInfo() {
        var values = null;
        this.platform.ready().then(() => {
            this.storage.query("SELECT * FROM student").then((data) => {
                this.student = {};
                if (data.res.rows.length > 0) {
                    for (var i = 0; i < data.res.rows.length; i++) {
                        // this.student.push({ firstname: data.res.rows.item(i).firstname, lastname: data.res.rows.item(i).lastname, email: data.res.rows.item(i).email, phone: data.res.rows.item(i).phone, yearinschool: data.res.rows.item(i).year, gender: data.res.rows.item(i).gender });
                        this.student = {
                            firstname: data.res.rows.item(i).firstname,
                            lastname: data.res.rows.item(i).lastname,
                            email: data.res.rows.item(i).email,
                            phone: data.res.rows.item(i).phone,
                            yearinschool: data.res.rows.item(i).year,
                            gender: data.res.rows.item(i).gender
                        }
                    }
                }
            }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error.err));
            });
        });
    }

    dismissModal() {
        this.viewCtrl.dismiss();
    }


    presentSuccessToast() {
    let toast = Toast.create({
        message: 'You information was updated successfully',
        duration: 3000,
        position: 'top'
    });

    toast.onDismiss(() => {
        console.log('Dismissed toast');
        this.dismissModal();
    });

    this.nav.present(toast);
}

    savePersonInfo(formData) {
        this.platform.ready().then(() => {

            this.storage.query("DELETE FROM student").then((data) => {
                console.log(JSON.stringify(data.res));
            }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error.err));
            });

            // this.storage.query("INSERT INTO student (firstname, lastname, email, phone, year, gender) VALUES ('Travis', 'Johnson', 'biggtrav05@gmail.com', '309-826-3126', 'Senior', 'Male')").then((data) => {
            //     console.log(JSON.stringify(data.res));
            // }, (error) => {
            //     console.log("ERROR -> " + JSON.stringify(error.err));
            // });

            this.storage.query("INSERT INTO student (firstname, lastname, email, phone, year, gender) VALUES ('" + formData.firstName + "', '" + formData.lastName + "', '" + formData.emailAddress + "', '" + formData.phoneNumber + "', '" + formData.yearInSchool + "', '" + formData.gender + "')").then((data) => {
                console.log(JSON.stringify(data.res));
                this.presentSuccessToast();
            }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error.err));
            });

        });

    }
}
