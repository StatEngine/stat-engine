'use strict';

import moment from 'moment';

export default function routerDecorator(
  $transitions, $rootScope, $cookies, $window, $state, Authorization, Principal, FireDepartment, Modal, Util, UnsupportedBrowser,
) {
  'ngInject';

  function getRenewSubscriptionHelpText() {
    return `To renew your subscription, visit the <a href="/subscriptionPortal" target="_blank">Manage Subscription</a> page or contact us at <a href="mailto:contact@statengine.io">contact@statengine.io</a> or by using the chat bubble <span class="space-nowrap">(<i class="fa fa-comments"></i>)</span> in the lower right corner.`;
  }

  function showSubscriptionGracePeriodWarning(serviceDaysRemaining) {
    const daysRemainingText = (serviceDaysRemaining === 1) ? `${serviceDaysRemaining} day` : `${serviceDaysRemaining} days`;
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

  async function showSubscriptionError(errorType, transition) {
    let title;
    let content;

    const currentPrincipal = await Principal.identity();
    if(errorType === 'SubscriptionCancelled') {
      title = 'Subscription Canceled';
      if(currentPrincipal.isDepartmentAdmin) {
        content = `
          Your subscription renewal grace period has elapsed and service has been suspended.<br/>
          <br/>
          ${getRenewSubscriptionHelpText()}
        `
      } else {
        content = "Your department's subscription has expired and service has been suspended. Please contact your department administrator to restore service.";
      }
    } else if(errorType === 'SubscriptionNull') {
      title = 'Subscription Not Found';
      content = `
        Your department's subscription was not found. Please try clicking the <strong>Refresh</strong> button below.<br/>
        <br/>
        If the issue persists, contact us at <a href="mailto:contact@statengine.io">contact@statengine.io</a> or by using the
        chat bubble <span class="space-nowrap">(<i class="fa fa-comments"></i>)</span> in the lower right corner.
      `;
    }

    const modal = Modal.custom({
      title,
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
          const subscription = await FireDepartment.refreshSubscription({
            id: currentPrincipal.fire_department__id,
          }).$promise;

          currentPrincipal.FireDepartment.subscription = subscription;

          modal.dismiss();
          $state.go(transition.$to().name);
        },
      }],
    });
    modal.present();
  }

  async function warnIfSubscriptionInGracePeriod() {
    // Don't show subscription expiry warning to global users, non-admins, or users without a department.
    const currentPrincipal = await Principal.identity();
    if(currentPrincipal.isGlobal || !currentPrincipal.isDepartmentAdmin || !currentPrincipal.FireDepartment) {
      return;
    }

    // Don't show the warning if they have don't have an active subscription.
    const subscription = currentPrincipal.FireDepartment.subscription;
    if(!subscription || subscription.status !== 'cancelled') {
      return;
    }

    // Calculate the days remaining before service is suspended.
    const cancelledAt = moment(subscription.cancelled_at * 1000);
    const serviceShutoffDate = cancelledAt.clone().add(subscription.grace_period_days, 'days');

    // If we have less than 1 day left, moment.diff() will return 0, so make it round up.
    const serviceDaysRemaining = serviceShutoffDate.diff(moment(), 'days') + 1;

    // Only show the warning if we fall within the grace period.
    if(serviceDaysRemaining > 0 && serviceDaysRemaining <= subscription.grace_period_days) {
      // Only show the warning once per day.
      const shownAt = moment(parseInt($cookies.get('subscription_expiry_warning_shown_at')) || 0);
      const daysSinceShown = moment().diff(shownAt, 'days');
      if(daysSinceShown >= 1) {
        showSubscriptionGracePeriodWarning(serviceDaysRemaining);
        $cookies.put('subscription_expiry_warning_shown_at', moment().valueOf());
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

  $transitions.onError({}, async function(trans) {
    const transError = trans.error();
    if(transError.detail && transError.detail.data && transError.detail.data.errors) {
      transError.detail.data.errors.forEach(async error => {
        if(error.type === 'SubscriptionCancelled' || error.type === 'SubscriptionNull') {
          await showSubscriptionError(error.type, trans);
        }
      });
    }
  });

  $transitions.onSuccess({}, async function(trans) {
    if(Principal.isAuthenticated()) {
      await warnIfSubscriptionInGracePeriod();
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
