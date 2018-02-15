'use strict';

export class EditTweetFormController {
  constructor($uibModalInstance, tweet, media) {
    this.$uibModalInstance = $uibModalInstance;

    this.title = 'Edit Tweet';
    this.tweet = tweet;
    this.media = media;

    this.selectedMediaId = this.tweet.media_path;
  }

  selectMedia = function(id) {
    this.selectedMediaId = id;
  }

  cancel = function () {
    this.$uibModalInstance.dismiss('cancel');
  }

  submitForm = function () {
    this.tweet.media_path = this.selectedMediaId;
    this.$uibModalInstance.close(this.tweet);
  }
};

export default class UserHomeController {
  /*@ngInject*/
  constructor($filter, $uibModal, Tweet, Modal, tweets) {
    this.$filter = $filter;
    this.$uibModal = $uibModal;

    this.TweetService = Tweet;
    this.modalService = Modal;
    this.tweets = tweets;
  }

  // Twitter
  previewTweet(tweet) {
    this.TweetService.get({ id: tweet._id },
      (updatedTweet) => {
        if (updatedTweet.date_tweeted) {
          this.$window.open(this.createTweetUrl(updatedTweet), "_blank")
        }
        else {
          let preview = updatedTweet.tweet_json.status;

          // replace hashtags with links for preview
          const re = /#\w+/g
          const matches = preview.match(re) || [];

          for (var i = 0; i < matches.length; i++) {
            preview = preview.replace(matches[i],
              '<a href="https://twitter.com/search?q=%23' + matches[i].substring(1) + '" target="_blank">' + matches[i] + '</a>')
          }
          preview += '<div class="row"><div class="col"><img class="img-responsive" src=' + updatedTweet.media_url + '></img></div></div>';
          this.modalService.ok()('Tweet Preview', preview);
        }
      });
  }

  refreshTweets() {
    this.TweetService.query({},
      (tweets) => this.tweets = tweets);
  }

  createTweetUrl(tweet) {
    return `https://twitter.com/${tweet.response_json.user.screen_name}/status/${tweet.response_json.id_str}`
  }

  editTweet(tweet) {
    const svc = this.TweetService;
    const modalInstance = this.$uibModal.open({
       template: require('./edit-tweet-form.html'),
       controller: ['$uibModalInstance', 'tweet', 'media', EditTweetFormController],
       controllerAs: 'vm',
       resolve: {
         tweet() {
           return angular.copy(tweet);
         },
         media() {
           return svc.query({ media: true}).$promise;
         }
       }
    });

     modalInstance.result.then((updatedTweet) => {
       this.TweetService.update(
         { id: tweet._id, action: 'edit'}, updatedTweet)
         .$promise.finally(() => this.refreshTweets());

     }, function () {
         // modal dismissed
     });
  }

  postTweet(tweet) {
    this.TweetService.update(
      { id: tweet._id, action: 'tweet'}, tweet)
      .$promise.then((res) => {
        const html =
          '<p>\
            Thanks for tweeting! You can check out the tweet \
            <a href="' + this.createTweetUrl(res) + '" target="_blank"> here.</a><br><br>\
            You currently have ' + res.response_json.user.followers_count + ' followers. Keep it up!\
          <p>'


        this.modalService.ok(this.refreshTweets.bind(this))('Thanks for Tweeting ', html, false);
      }, (err) => {
        const html = '\
          <p class="text-danger">Please try again later. If this error persists, please contact an administrator. <p>\
          <label>Details:</label><br>' + this.$filter('json')(err.data.response_json);
        this.modalService.ok(this.refreshTweets.bind(this))('Tweet Failed', html, true);
      });
  }

  deleteTweet(tweet) {
    this.TweetService.delete({ id: tweet._id })
      .$promise.finally(() => this.refreshTweets());
  }
}
