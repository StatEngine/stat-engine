'use strict';

import angular from 'angular';
import moment from 'moment-timezone';

export class SubscriptionBannerComponent {
  constructor(Principal) {
    this.principal = Principal;
    this.principal
      .identity(true)
      .then(response => this.currentPrincipal = response);
  }

  get isSubscriptionActive() {
    const subscription = this.principal.getSubscription();
    return subscription && subscription.status !== 'cancelled';
  }

  get isUserDepartmentAdmin() {
    return this.currentPrincipal && this.currentPrincipal.isDepartmentAdmin;
  }

  get daysRemaining() {
    const subscription = this.principal.getSubscription();
    if (subscription) {
      const daysToRenewSubscription = 45;
      const canceledAt = moment(subscription.cancelled_at * 1000);
      const daysSinceCancellation = moment().diff(canceledAt, 'days');
      const daysRemaining = daysToRenewSubscription - daysSinceCancellation;
      return daysRemaining;
    }
  }
}

export default angular.module('subscriptionBanner', [])
  .component('subscriptionBanner', {
    template: require('./subscription-banner.html'),
    controller: SubscriptionBannerComponent,
    controllerAs: 'vm',
  })
  .name;
