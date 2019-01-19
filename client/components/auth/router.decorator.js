'use strict';

import moment from 'moment';

export default function routerDecorator($transitions, $rootScope, $cookies, $window, Authorization, Principal, FireDepartment, Modal) {
  'ngInject';

  let currentPrincipal;
  let subscription;
  const daysToRenewSubscription = 45;

  async function refreshSubscription() {
    if(!currentPrincipal) {
      currentPrincipal = await Principal.identity();
    }

    if(currentPrincipal && currentPrincipal.isDepartmentAdmin) {
      subscription = await FireDepartment.getSubscription({ id: currentPrincipal.fire_department__id }).$promise;
    }
  }

  function showSubscriptionExpiredWarning(daysSinceCancellation) {
    // Only show the warning once per day.
    const shownAt = moment(parseInt($cookies.get('subscription_expiry_warning_shown_at')) || 0);
    const daysSinceShown = moment().diff(shownAt, 'days');
    if(daysSinceShown >= 1) {
      const daysRemaining = daysToRenewSubscription - daysSinceCancellation;
      const daysRemainingText = (daysRemaining === 1) ? `${daysRemaining} day` : `${daysRemaining} days`;
      Modal.alert({
        title: 'Subscription Canceled',
        content: `
          Please renew your subscription. You have <strong>${daysRemainingText}</strong> remaining before your service will be suspended.<br/>
          <br/>
          To renew your subscription, please contact us at <a href="mailto:contact@statengine.io">contact@statengine.io</a> or by using the chat bubble (<i class="fa fa-comments"></i>) in the lower right corner.
        `,
        showCloseButton: false,
        enableBackdropDismiss: false,
        cancelButtonText: 'Ignore',
      }).present();

      $cookies.put('subscription_expiry_warning_shown_at', moment().valueOf());
    }
  }

  function showSubscriptionExpired() {
    const modal = Modal.custom({
      title: 'Subscription Canceled',
      content: `
        Your subscription renewal grace period has elapsed and service has been suspended.<br/>
        <br/>
        To renew your subscription, please contact us at <a href="mailto:contact@statengine.io">contact@statengine.io</a> or by using the chat bubble (<i class="fa fa-comments"></i>) in the lower right corner.
      `,
      cancelButtonText: 'Refresh',
      showCloseButton: false,
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Refresh',
        style: Modal.buttonStyle.primary,
        dismisses: false,
        onClick: async () => {
          await refreshSubscription();
          if(subscription.status !== 'cancelled') {
            modal.dismiss();
          }
        },
      }],
    });
    modal.present();
  }

  async function checkSubscriptionExpiry() {
    // Only get the subscription data once to avoid unnecessary requests.
    if(!subscription) {
      await refreshSubscription();
    }

    if(subscription.status === 'cancelled') {
      const canceledAt = moment(subscription.cancelled_at * 1000);
      const daysSinceCancellation = moment().diff(canceledAt, 'days');

      if(daysSinceCancellation < daysToRenewSubscription) {
        showSubscriptionExpiredWarning(daysSinceCancellation);
      } else {
        showSubscriptionExpired();
      }
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
