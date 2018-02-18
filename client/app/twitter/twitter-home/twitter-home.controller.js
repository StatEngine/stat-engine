'use strict';

import angular from 'angular';
import _ from 'lodash';

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
  constructor($window, $filter, $uibModal, $http, Twitter, Modal, twitterProfile, tweets) {
    this.$window = $window;
    this.$filter = $filter;
    this.$uibModal = $uibModal;
    this.$http = $http;

    this.TwitterService = Twitter;
    this.modalService = Modal;
    this.twitterProfile = twitterProfile;
    this.tweets = tweets;

    this.authorized = !_.isEmpty(twitterProfile);
  }

  authorize() {
    this.$http.get('/api/twitter/account/login')
      .then(response => { this.$window.location.href = response.data; });
  }

  previewTweet(tweet) {
    this.TwitterService.getTweet(
      { id: tweet._id },
      updatedTweet => {
        if(updatedTweet.date_tweeted) {
          this.$window.open(TwitterHomeController.createTweetUrl(updatedTweet), '_blank');
        } else {
          let preview = updatedTweet.tweet_json.status;

          // replace hashtags with links for preview
          const re = /#\w+/g;
          const matches = preview.match(re) || [];

          for(var i = 0; i < matches.length; i++) {
            preview = preview.replace(
              matches[i],
              `<a href="https://twitter.com/search?q=%23${matches[i].substring(1)}" target="_blank"> ${matches[i]}  </a>`
            );
          }
          preview += `<div class="row"><div class="col"><img class="img-responsive" src=${updatedTweet.media_url}></img></div></div>`;
          this.modalService.ok()('Tweet Preview', preview);
        }
      }
    );
  }

  refreshTweets() {
    this.TwitterService.getTweets(
      {},
      tweets => {
        this.tweets = tweets;
      }
    );
  }

  static createTweetUrl(tweet) {
    return `https://twitter.com/${tweet.response_json.user.screen_name}/status/${tweet.response_json.id_str}`;
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
          return svc.getTweets({ media: true}).$promise;
        }
      }
    });

    modalInstance.result.then(updatedTweet => {
      this.TwitterService.updateTweet({ id: tweet._id, action: 'edit'}, updatedTweet)
        .$promise.finally(() => this.refreshTweets());
    }, () => {
      // modal dismissed
    });
  }

  postTweet(tweet) {
    this.TwitterService.updateTweet({ id: tweet._id, action: 'tweet'}, tweet)
      .$promise.then(res => {
        const html = `\
          <p>\
            Thanks for tweeting! You can check out the tweet \
            <a href="${TwitterHomeController.createTweetUrl(res)}" target="_blank"> here.</a><br><br>\
            You currently have ${res.response_json.user.followers_count} followers. Keep it up!\
          <p>`;


        this.modalService.ok(this.refreshTweets.bind(this))('Thanks for Tweeting ', html, false);
      }, err => {
        const html = `\
          <p class="text-danger">Please try again later. If this error persists, please contact an administrator. <p>\
          <label>Details:</label><br>${this.$filter('json')(err.data.response_json)}`;
        this.modalService.ok(this.refreshTweets.bind(this))('Tweet Failed', html, true);
      });
  }

  deleteTweet(tweet) {
    this.TwitterService.deleteTweet({ id: tweet._id })
      .$promise.finally(() => this.refreshTweets());
  }
}
