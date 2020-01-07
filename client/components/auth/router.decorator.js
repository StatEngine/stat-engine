'use strict';

import moment from 'moment-timezone';

export default function routerDecorator(
  $transitions, $rootScope, $cookies, $window, $state, Authorization, Principal, FireDepartment, Modal, Util, UnsupportedBrowser,
) {
  'ngInject';

  let currentPrincipal;
  let subscription;
  const daysToRenewSubscription = 45;

  async function refreshSubscription() {
    if(currentPrincipal) {
      subscription = await FireDepartment.getSubscription({ id: currentPrincipal.fire_department__id }).$promise;
    }
  }

  function getRenewSubscriptionHelpText() {
    return `To renew your subscription, visit the <a href="/subscriptionPortal" target="_blank">Manage Subscription</a> page or contact us at <a href="mailto:contact@statengine.io">contact@statengine.io</a> or by using the chat bubble <span class="space-nowrap">(<i class="fa fa-comments"></i>)</span> in the lower right corner.`
  }

  function showSubscriptionExpiredWarning(daysSinceCancellation) {
    const daysRemaining = daysToRenewSubscription - daysSinceCancellation;
    const daysRemainingText = (daysRemaining === 1) ? `${daysRemaining} day` : `${daysRemaining} days`;
    Modal.alert({
      title: 'Subscription Canceled',
      content: `
        Please renew your subscription. You have <strong>${daysRemainingText}</strong> remaining before your service will be suspended.<br/>
        <br/>
        ${getRenewSubscriptionHelpText()}
      `,
      showCloseButton: false,
      enableBackdropDismiss: false,
      cancelButtonText: 'Ignore',
    }).present();
  }

  function showSubscriptionExpired() {
    let content;
    if(currentPrincipal.isDepartmentAdmin) {
      content = `
        Your subscription renewal grace period has elapsed and service has been suspended.<br/>
        <br/>
        ${getRenewSubscriptionHelpText()}
      `
    } else {
      content = "Your department's subscription has expired and service has been suspended. Please contact your department administrator to restore service.";
    }

    const modal = Modal.custom({
      title: 'Subscription Canceled',
      content,
      cancelButtonText: 'Refresh',
      showCloseButton: false,
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Sign Out',
        style: Modal.buttonStyle.danger,
        onClick: async () => {
          try {
            await Principal.logout();
          } catch(err) {}
          $state.go('site.main.main');
        },
      }, {
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
    currentPrincipal = await Principal.identity();

    // Ignore subscription expiry for global users.
    if(currentPrincipal.isGlobal) {
      return;
    }

    // Only get the subscription data when necessary.
    if(!subscription || subscription.customer_id !== currentPrincipal.FireDepartment.customer_id) {
      await refreshSubscription();
    }

    if(subscription && subscription.status === 'cancelled') {
      const canceledAt = moment(subscription.cancelled_at * 1000);
      const daysSinceCancellation = moment().diff(canceledAt, 'days');
      if(daysSinceCancellation < daysToRenewSubscription) {
        if(currentPrincipal.isDepartmentAdmin) {
          // Only show the warning once per day.
          const shownAt = moment(parseInt($cookies.get('subscription_expiry_warning_shown_at')) || 0);
          const daysSinceShown = moment().diff(shownAt, 'days');
          if(daysSinceShown >= 1) {
            showSubscriptionExpiredWarning(daysSinceCancellation);
            $cookies.put('subscription_expiry_warning_shown_at', moment().valueOf());
          }
        }
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

  $transitions.onSuccess({}, function(trans) {
    if(Principal.isAuthenticated()) {
      checkSubscriptionExpiry();
    }

    // Show warning dialog for IE browsers if a user is logged in or navigates to login or signup.
    if(Principal.isAuthenticated() ||
       trans.$to().name === 'site.account.login' ||
       trans.$to().name === 'site.account.signup') {
      if(Util.isBrowserIE()) {
        const shownAt = moment(parseInt($cookies.get('unsupported_browser_warning_shown_at')) || 0);
        const daysSinceShown = moment().diff(shownAt, 'days');
        if(daysSinceShown >= 7) {
          UnsupportedBrowser.showWarningDialog();
          $cookies.put('unsupported_browser_warning_shown_at', moment().valueOf());
        }
      }
    }
  });
}
