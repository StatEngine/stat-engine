'use strict';

// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';
import { getErrors } from '../../../util/error';

export default class UserSettingsController {
  profile = {
    inputs: {
      firstName: '',
      lastName: '',
    },
    form: null,
    errors: [],
    showSaved: false,
    isSaving: false,
  };
  email = {
    inputs: {
      enabled: {},
    },
    form: null,
    errors: [],
    showSaved: false,
    isSaving: false,
  };
  password = {
    inputs: {
      currentPassword: '',
      newPassword: '',
      newPasswordRepeat: '',
    },
    form: null,
    errors: [],
    showSaved: false,
    isSaving: false,
  };

  /*@ngInject*/
  constructor($scope, $state, $location, User, currentPrincipal, AmplitudeService, AnalyticEventNames, reportNames) {
    this.$scope = $scope;
    this.$state = $state;
    this.$location = $location;
    this.user =  currentPrincipal;
    this.UserService = User;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.reportNames = reportNames;

    // Copy user data into inputs.
    this.profile.inputs.firstName = this.user.first_name;
    this.profile.inputs.lastName = this.user.last_name;
    this.reportNames.forEach(reportName => {
      this.email.inputs.enabled[reportName] = this.isUserSubscribedTo(reportName);
    });

    // Change tab when the url hash changes.
    this.updateSelectedTab();
    this.$scope.$watch(() => this.$location.hash(), () => {
      this.updateSelectedTab();
    });
  }

  updateSelectedTab() {
    // Select tab in url hash (if one exists).
    const tabName = this.$location.hash();
    if(tabName) {
      $(`#nav-${tabName}-tab`).tab('show');
    } else {
      $('#nav-profile-tab').tab('show');
      this.$location.hash('profile');
    }
  }

  isUserSubscribedTo(emailName) {
    // Check if this email is currently unsubscribed in the user data.
    if(!this.user.unsubscribed_emails) {
      return true;
    }

    return !this.user.unsubscribed_emails.split(',').includes(emailName);
  }

  $onInit() {
    this.profile.form = $('#profileForm').parsley();
    this.email.form = $('#emailForm').parsley();
    this.password.form = $('#passwordForm').parsley();
  }

  async saveProfile(form) {
    this.profile.showSaved = false;

    if(!this.profile.form.isValid()) {
      return;
    }

    this.profile.isSaving = true;
    this.profile.errors = null;
    try {
      await this.UserService.update({ id: this.user._id }, {
        first_name: this.profile.inputs.firstName,
        last_name: this.profile.inputs.lastName,
      }).$promise;
    } catch (err) {
      this.profile.errors = getErrors(err);
      return;
    } finally {
      this.profile.isSaving = false;
    }

    // Update local user data.
    this.user.first_name = this.profile.inputs.firstName;
    this.user.last_name = this.profile.inputs.lastName;

    this.profile.showSaved = true;
    form.$setPristine(true);
  }

  profileHasChanges() {
    return (
      this.profile.inputs.firstName !== this.user.first_name ||
      this.profile.inputs.lastName !== this.user.last_name
    );
  }

  profileDisableSaveButton() {
    return (!this.profileHasChanges() || this.profile.isSaving);
  }

  async saveEmail(form) {
    this.email.showSaved = false;

    if(!this.email.form.isValid()) {
      return;
    }

    // Translate our toggle switches into an array of unsubscribed email ids that the server expects.
    const unsubscribedEmails = Object.keys(this.email.inputs.enabled)
      .filter(reportName => !this.email.inputs.enabled[reportName]);

    // Track unsubscribes in analytics (only log the events after the user update succeeds).
    const newlyUnsubscribed = unsubscribedEmails
      .filter(emailName => (!this.user.unsubscribed_emails || !this.user.unsubscribed_emails.includes(emailName)));

    this.email.isSaving = true;
    this.email.errors = null;
    try {
      await this.UserService.update({ id: this.user._id }, {
        unsubscribed_emails: unsubscribedEmails.join(','),
      }).$promise;
    } catch (err) {
      this.email.errors = getErrors(err);
      return;
    } finally {
      this.email.isSaving = false;
    }

    // Log unsubscribe events.
    newlyUnsubscribed.forEach(emailName => {
      this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
        app: 'User Settings',
        action: 'unsubscribed email',
        emailName,
      });
    });

    // Update local user data.
    this.user.unsubscribed_emails = unsubscribedEmails.join(',');

    this.email.showSaved = true;
    form.$setPristine(true);
  }

  emailHasChanges() {
    for(const emailName of Object.keys(this.email.inputs.enabled)) {
      if(this.email.inputs.enabled[emailName] !== this.isUserSubscribedTo(emailName)) {
        return true;
      }
    }

    return false;
  }

  emailDisableSaveButton() {
    return (!this.emailHasChanges() || this.email.isSaving);
  }

  async changePassword(form) {
    this.password.showSaved = false;

    if(!this.password.form.isValid()) {
      return;
    }

    this.password.isSaving = true;
    this.password.errors = null;
    try {
      await this.UserService.changePassword({ id: this.user._id }, {
        username: this.user.username,
        oldPassword: this.password.inputs.currentPassword,
        newPassword: this.password.inputs.newPassword,
      }).$promise
    } catch (err) {
      this.password.errors = getErrors(err);
      return;
    } finally {
      this.password.isSaving = false;
    }

    // Logged in, redirect to user home
    this.password.showSaved = true;
    form.$setPristine(true);
  }

  passwordDisableSaveButton() {
    return (
      this.password.inputs.currentPassword.length === 0 ||
      this.password.inputs.newPassword.length === 0 ||
      this.password.inputs.newPasswordRepeat.length === 0 ||
      this.password.isSaving
    );
  }

  handleTabClick(tabName) {
    this.$location.hash(tabName);

    this.profile.showSaved = false;
    this.email.showSaved = false;
    this.password.showSaved = false;
  }
}
