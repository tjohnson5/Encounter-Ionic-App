import {Component, Type, provide} from '@angular/core';
import {Platform, ionicBootstrap, Storage, SqlStorage} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {TabsPage} from './pages/tabs/tabs';
import {AudioProvider, WebAudioProvider} from 'ionic-audio/dist/ionic-audio';
// https://angular.io/docs/ts/latest/api/core/Type-interface.html



@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  //providers:  [provide(AudioProvider,  { useFactory: AudioProvider.factory })] // or use [WebAudioProvider] to force HTML5 Audio
})
export class MyApp {
  rootPage: any = TabsPage;
  storage: Storage = null;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      this.storage = new Storage(SqlStorage);

      //   this.storage.query('DROP TABLE IF EXISTS people').then((data) => {
      //             console.log("PEOPLE ABLE DROPPED -> " + JSON.stringify(data.res));
      //         }, (error) => {
      //             console.log("ERROR DROPPING PEOPLE TABLE -> " + JSON.stringify(error.err));
      //         });

      this.storage.query('CREATE TABLE IF NOT EXISTS student (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, lastname TEXT, email TEXT, phone TEXT, year TEXT, gender TEXT, registeredevents TEXT)').then((data) => {
                console.log("STUDENT TABLE CREATED -> " + JSON.stringify(data.res));
            }, (error) => {
                console.log("STUDENT Table creation ERROR -> " + JSON.stringify(error.err));
            });


    });
  }
}

// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/

ionicBootstrap(MyApp, [provide(AudioProvider,  { useFactory: AudioProvider.factory })], {
  // tabbarPlacement: 'bottom'
});
