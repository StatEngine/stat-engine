'use strict';

export default class UserHomeController {
  /*@ngInject*/
  constructor($window, currentPrincipal, currentFireDepartment, dataQuality, tweets, Tweet) {

    this.TweetService = Tweet;

    this.principal = currentPrincipal;
    this.fireDepartment = currentFireDepartment;
    this.dataQuality = dataQuality;
    this.tweets = tweets;

    const date = new Date().getHours();
    this.greeting = date < 12 ? 'Good Morning' : date < 18 ? 'Good Afternoon' : 'Good Evening';

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    this.dashboard = function() {
      $window.location.href = '/dashboard';
    };
  }

  refreshTweets() {
    this.TweetService.query({ firecaresId: this.fireDepartment.firecares_id },
      (tweets) => this.tweets = tweets);

  }
  
  deleteTweet(tweet) {
    this.TweetService.delete({ id: tweet._id, firecaresId: this.fireDepartment.firecares_id },
      () => this.refreshTweets());
  }
}
