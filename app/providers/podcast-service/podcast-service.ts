import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the PodcastService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PodcastService {
  data: any;

  constructor(private http: Http) {
    this.data = null;
  }

  load() {
    if (this.data) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      this.http.get('https://query.yahooapis.com/v1/public/yql?q=select%20title%2C%20enclosure.url%2C%20pubDate%2C%20description%20from%20rss%20where%20url%3D%22http%3A%2F%2Fwww.isuencounter.org%2Fpodcast%2F%22&format=json&diagnostics=true&callback=')
        .map(res => res.json())
        .subscribe(data => {
          this.data = data.query.results.item;
          resolve(this.data);
        });
    });
  }


  // findAll() {
  //     var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20title%2C%20link%2C%20pubDate%2C%20description%20from%20rss%20where%20url%3D%22http%3A%2F%2Fwww.isuencounter.org%2Fpodcast%2F%22&format=json&diagnostics=true&callback=';
  //       return this.http.get(url)
  //           .map(res => res.json())
  //           .catch(this.handleError);
  //   }
  //   handleError(error) {
  //       console.error(error);
  //       return Observable.throw(error.json().error || 'Server error');
  //   }
}
