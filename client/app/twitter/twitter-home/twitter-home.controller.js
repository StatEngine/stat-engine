/* eslint  class-methods-use-this: 0 */

'use strict';

import angular from 'angular';

let _;

function importAll(r) {
  let images = {};
  r.keys().map(item => {
    images[item.replace('./', '')] = r(item); return images;
  });
  return images;
}

const images = importAll(require.context('../../../assets/images/twitter-media/', false, /\.(png|jpe?g|svg)$/));

export class EditTweetFormController {
  constructor($uibModalInstance, tweet, media) {
    this.$uibModalInstance = $uibModalInstance;

    this.title = 'Edit Tweet';
    this.tweet = tweet;
    this.media = media;

    this.selectedMediaId = this.tweet.media_path;
  }

  selectMedia(id) {
    this.selectedMediaId = id;
  }

  loadImage(path) {
    return images[path];
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  submitForm() {
    this.tweet.media_path = this.selectedMediaId;
    this.$uibModalInstance.close(this.tweet);
  }
}

export default class TwitterHomeController {
  /*@ngInject*/
  constructor($window, $filter, $scope, $uibModal, $http, Twitter, Modal, twitterProfile, recommendedTweets, recentTweets, AmplitudeService, AnalyticEventNames) {
    this.$window = $window;
    this.$filter = $filter;
    this.$uibModal = $uibModal;
    this.$scope = $scope;
    this.$http = $http;

    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;

    this.TwitterService = Twitter;
    this.modalService = Modal;
    this.twitterProfile = twitterProfile;
    this.profileUrl = this.twitterProfile.profile_image_url_https;
    this.profileUrl = this.profileUrl ? `${this.profileUrl.slice(0, -10)}bigger.jpg` : undefined;
    this.recommendedTweets = recommendedTweets;
    this.recentTweets = recentTweets;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.authorized = !_.isEmpty(this.twitterProfile);
  }

  authorize() {
    this.$http.get('/api/twitter/account/login')
      .then(response => {
        this.$window.location.href = response.data;
      });
  }

  previewTweet(tweet) {
    this.TwitterService.previewTweet({}, tweet, tweetPreview => {
      let preview = tweetPreview.tweet_json.status;

      // replace hashtags with links for preview
      const re = /#\w+/g;
      const matches = preview.match(re) || [];

      for(var i = 0; i < matches.length; i++) {
        preview = preview.replace(
          matches[i],
          `<a href="https://twitter.com/search?q=%23${matches[i].substring(1)}" target="_blank"> ${matches[i]}  </a>`
        );
      }

      if(tweetPreview.media_url) preview += `<div class="row"><div class="col"><img class="img-responsive" src=${tweetPreview.media_url}></img></div></div>`;
      this.modalService.ok()('Tweet Preview', preview);
    });
  }

  refreshTweets() {
    this.TwitterService.getRecommendedTweets(
      {},
      tweets => {
        this.recommendedTweets = tweets;
      }
    );

    this.TwitterService.getRecentTweets(
      {},
      tweets => {
        this.recentTweets = tweets;
      }
    );
  }

  static createTweetUrl(tweet) {
    return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
  }

  editTweet(tweet) {
    const svc = this.TwitterService;
    const modalInstance = this.$uibModal.open({
      template: require('./edit-tweet-form.html'),
      controller: ['$uibModalInstance', 'tweet', 'media', EditTweetFormController],
      controllerAs: 'vm',
      resolve: {
        tweet() {
          return angular.copy(tweet);
        },
        media() {
          return svc.getRecommendedTweets({ media: true}).$promise;
        }
      }
    });

    modalInstance.result.then(updatedTweet => {
      tweet.tweet_json.status = updatedTweet.tweet_json.status;
      tweet.media_text = updatedTweet.media_text;
      tweet.media_path = updatedTweet.media_path;
    }, () => {
      // modal dismissed
    });
  }

  openTweet(tweet) {
    this.$window.open(TwitterHomeController.createTweetUrl(tweet));
  }

  tweetTweet(tweet) {
    this.TwitterService.tweetTweet({}, tweet)
      .$promise.then(res => {
        const html = `\
          <p>\
            Thanks for tweeting! You can check out the tweet \
            <a href="${TwitterHomeController.createTweetUrl(res)}" target="_blank"> here.</a><br><br>\
            You currently have ${res.user.followers_count} followers. Keep it up!\
          <p>`;

        this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
          app: 'TWITTER',
          action: 'tweet',
        });

        this.modalService.ok(this.refreshTweets.bind(this))('Thanks for Tweeting ', html, false);
      }, err => {
        console.dir(err);
        const html = '\
          <p class="text-danger">Please try again later. If this error persists, please contact an administrator. <p>\
          <label>Details:</label><br>';
        this.modalService.ok(this.refreshTweets.bind(this))('Tweet Failed', html, err.data);
      });
  }
}
