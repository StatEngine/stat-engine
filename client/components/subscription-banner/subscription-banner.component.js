'use strict';

import angular from 'angular';
import moment from 'moment-timezone';

export class SubscriptionBannerComponent {
  constructor(Principal) {
    this.Principal = Principal;
  }

  async $onInit() {
    this.currentPrincipal = await this.Principal.identity();
  }

  get isLoaded() {
    return this.currentPrincipal != null;
  }

  get isSubscriptionActive() {
    const subscription = this.currentPrincipal && this.currentPrincipal.FireDepartment.subscription;
    return subscription && subscription.status !== 'cancelled';
  }

  get isUserDepartmentAdmin() {
    return this.currentPrincipal && this.currentPrincipal.isDepartmentAdmin;
  }

  get daysRemaining() {
    return this.Principal.serviceDaysRemaining;
  }
}

export default angular.module('subscriptionBanner', [])
  .component('subscriptionBanner', {
    template: require('./subscription-banner.html'),
    controller: SubscriptionBannerComponent,
    controllerAs: 'vm',
  })
  .name;
