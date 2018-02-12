'use strict';

export class EditTweetFormController {
  constructor($uibModalInstance, tweet) {
    this.$uibModalInstance = $uibModalInstance;

    this.title = 'Edit Tweet';
    this.tweet = tweet;
  }

  cancel = function () {
    this.$uibModalInstance.dismiss('cancel');
  }

  submitForm = function () {
    console.info(this.tweet)
    this.$uibModalInstance.close(this.tweet);
  }
};

export default class UserHomeController {
  /*@ngInject*/
  constructor($window, $filter, currentPrincipal, currentFireDepartment, dataQuality, tweets, Tweet, Modal, $uibModal) {

    this.$filter = $filter;
    this.$window = $window;
    this.$uibModal = $uibModal;

    this.TweetService = Tweet;
    this.modalService = Modal;
    this.principal = currentPrincipal;
    this.fireDepartment = currentFireDepartment;
    this.dataQuality = dataQuality;
    this.tweets = tweets;

    const hours = new Date().getHours();
    this.greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    this.gettingStarted = [
      // { step: 'Assigned Fire Department',
      //   status: _.isNumber(this.principal.fire_department__id),
      //   action: 'What department are you with?'
      // },
      { step: 'Connect your data.',
        status: _.get(this.fireDepartment, 'integration_complete', false),
        action: 'Contact our integration team at <a id=\'user-home-getting-started-connect-data-email\' target="_blank" href="mailto:contact@statengine.io">contact@statengine.io</a> to learn how to integrate your data into StatEngine.'
      },
      { step: 'Verify your data.',
        status: _.get(this.fireDepartment, 'integration_verified', false),
        action: 'Visit your dashboard and confirm that everything looks good!'
      },
      { step: 'Access your dashboard.',
        status: this.principal.roles.indexOf('kibana_admin') > -1,
        action: 'After your data integration is complete, we\'ll create a custom dashboard just for you!'
      },
    ];

    this.setupComplete = this.gettingStarted.every(t => t.status === true);

    this.dashboard = function() {
      this.$window.location.href = '/dashboard';
    };
  }

  previewTweet(tweet) {
    if (tweet.date_tweeted) {
      this.$window.open(this.createTweetUrl(tweet), "_blank")
    }
    else {
      let preview = tweet.tweet_json.status + ' #PoweredByStatEngine';

      // replace hashtags with links for preview
      const re = /#\w+/g
      const matches = preview.match(re);

      for (var i = 0; i < matches.length; i++) {
        preview = preview.replace(matches[i],
          '<a href="https://twitter.com/search?q=%23' + matches[i].substring(1) + '" target="_blank">' + matches[i] + '</a>')
      }
      this.modalService.ok()('Tweet Preview', preview);
    }
  }

  refreshTweets() {
    this.TweetService.query({ firecaresId: this.fireDepartment.firecares_id },
      (tweets) => this.tweets = tweets);
  }

  createTweetUrl(tweet) {
    return `https://twitter.com/${tweet.response_json.user.screen_name}/status/${tweet.response_json.id_str}`
  }

  editTweet(tweet) {
    const modalInstance = this.$uibModal.open({
       template: require('./edit-tweet-form.html'),
       controller: ['$uibModalInstance', 'tweet', EditTweetFormController],
       controllerAs: 'vm',
       resolve: {
         tweet: function () {
           return angular.copy(tweet);
          }
       }
    });

     modalInstance.result.then((updatedTweet) => {
       this.TweetService.update(
         { id: tweet._id, firecaresId: this.fireDepartment.firecares_id, action: 'edit'}, updatedTweet)
         .$promise.finally(() => this.refreshTweets());

     }, function () {
         // modal dismissed
     });
  }

  postTweet(tweet) {
    this.TweetService.update(
      { id: tweet._id, firecaresId: this.fireDepartment.firecares_id, action: 'tweet'}, tweet)
      .$promise.then((res) => {
        const html =
          '<p>\
            Thanks for tweeting! You can check out the tweet \
            <a href="' + this.createTweetUrl(res) + '" target="_blank"> here.</a><br><br>\
            You currently have ' + res.response_json.user.followers_count + ' followers. Keep it up!\
          <p>'

        this.modalService.ok()('Thanks for Tweeting ', html, false);
      }, (err) => {
        const html = '\
          <p class="text-danger">Please try again later. If this error persists, please contact an administrator. <p>\
          <label>Details:</label><br>' + this.$filter('json')(err.data.response_json);
        this.modalService.ok()('Tweet Failed', html, true);
      })
      .finally(() => this.refreshTweets());
  }

  deleteTweet(tweet) {
    this.TweetService.delete({ id: tweet._id, firecaresId: this.fireDepartment.firecares_id })
      .$promise.finally(() => this.refreshTweets());
  }

  addTweetMedia(tweet) {
    var f = document.getElementById('file').files[0],
        r = new FileReader();

    r.onloadend = function(e) {
      var data = e.target.result;
      //send your binary data via $http or $resource or do anything else with it
    }

    r.readAsBinaryString(f);
  }

}
