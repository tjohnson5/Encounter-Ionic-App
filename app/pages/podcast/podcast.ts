import { Page } from 'ionic-angular';
import {Component} from "@angular/core";
import { NavController, Loading } from 'ionic-angular';
import {PodcastService} from '../../providers/podcast-service/podcast-service';
import {Http, Headers} from '@angular/http';
import {AudioTrackComponent, AudioTrackPlayComponent, AudioTrackProgressComponent, AudioTrackProgressBarComponent, AudioTimePipe, AudioProvider} from 'ionic-audio/dist/ionic-audio';

/*
  Generated class for the PodcastPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/podcast/podcast.html',
    directives: [AudioTrackComponent, AudioTrackPlayComponent, AudioTrackProgressComponent, AudioTrackProgressBarComponent],
    providers: [PodcastService],
})
export class PodcastPage {
    public podcasts: any;
    myTracks: any[];
    allTracks: any[];

    constructor(private nav: NavController, public podcastService: PodcastService, private _audioProvider: AudioProvider) {
        this.nav = nav;
        this.presentLoadingDefault();
        this.loadPodcasts();
    }

    presentLoadingDefault() {
        let loading = Loading.create({
            content: 'Loading Podcast...'
        });

        this.nav.present(loading);

        setTimeout(() => {
            loading.dismiss();
        }, 5000);
    }

    doRefresh(refresher) {

        this.loadPodcasts();

        setTimeout(() => {
            console.log('Refresh: Async operation has ended');
            refresher.complete();
        }, 2000);
    }

    loadPodcasts() {
        this.podcastService.load()
            .then(data => {
                console.log(data);
                this.podcasts = data.map(function(post) {
                    // The .map lets me take the original data and map it to the format the audio player wants
                    return {
                        title: post.title,
                        date: post.pubDate,
                        description: post.description,
                        src: post.enclosure.url
                    }
                });
                console.log(this.podcasts);
            });
    }


    ngAfterContentInit() {
        // get all tracks managed by AudioProvider so we can control playback via the API
        this.allTracks = this._audioProvider.tracks;
    }

    playSomeTrack(selectedTrackIndex: number) {
        // do something with the track in response to some action
        this._audioProvider.play(selectedTrackIndex);
    }

    onTrackFinished(track: any) {
        console.log('Track finished', track)
    }
}
