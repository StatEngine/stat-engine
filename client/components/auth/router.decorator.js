'use strict';

import moment from 'moment';

export default function routerDecorator($transitions, $rootScope, $cookies, Authorization, Principal, FireDepartment, Modal) {
  'ngInject';

  let subscription;

  async function checkSubscriptionExpiry() {
    // Check if the user's subscription has expired. If it is, show a dialog informing them once per day.
    const currentPrincipal = await Principal.identity();
    if(!currentPrincipal || !currentPrincipal.isDepartmentAdmin) {
      return;
    }

    // Only get the subscription data once to avoid unnecessary requests.
    if(!subscription) {
      subscription = await FireDepartment.getSubscription({ id: currentPrincipal.fire_department__id }).$promise;
    }

    const shownAt = moment(parseInt($cookies.get('subscription_expiry_shown_at')) || 0);
    if(subscription.status === 'cancelled' && moment().diff(shownAt, 'days') >= 1) {
      Modal.confirm({
        title: 'Subscription Canceled',
        content: 'Please renew your subscription soon to avoid any interruption of your service.',
        cancelButtonText: 'Ignore',
        confirmButtonText: 'Manage Subscription',
        onConfirm: () => this.$window.open('/subscriptionPortal', '_blank'),
      }).present();

      $cookies.put('subscription_expiry_shown_at', moment().valueOf());
    }
  }

  $transitions.onStart({}, function(trans) {
    $rootScope.toState = trans.to();
    $rootScope.fromState = trans.from();

    return Principal.init()
      .then(() => {
        if(Principal.isIdentityResolved()) {
          Authorization.authorize();
        }
      });
  });

  $transitions.onSuccess({}, function() {
    checkSubscriptionExpiry();
  });
}
