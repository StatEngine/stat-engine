'use strict';

// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';

import { TimeUnit } from '../../../components/constants/time-unit';

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
      shiftReportEnabled: true,
      weekReportEnabled: true,
      monthReportEnabled: true,
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
  constructor($scope, $state, $location, User, currentPrincipal, AmplitudeService, AnalyticEventNames) {
    this.$scope = $scope;
    this.$state = $state;
    this.$location = $location;
    this.user =  currentPrincipal;
    this.UserService = User;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;

    // Copy user data into inputs.
    this.profile.inputs.firstName = this.user.first_name;
    this.profile.inputs.lastName = this.user.last_name;
    this.email.inputs.shiftReportEnabled = !this.isUserUnsubscribedToReportType(TimeUnit.Shift);
    this.email.inputs.weekReportEnabled = !this.isUserUnsubscribedToReportType(TimeUnit.Week);
    this.email.inputs.monthReportEnabled = !this.isUserUnsubscribedToReportType(TimeUnit.Month);

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

  isUserUnsubscribedToReportType(timeUnit) {
    if(!this.user.unsubscribed_emails) {
      return false;
    }

    const emailId = this.getTimeRangeEmailId(timeUnit);

    // Check if this email report type is currently enabled in the user data.
    for(const unsubscribedEmailId of this.user.unsubscribed_emails.split(',')) {
      if(unsubscribedEmailId.toLowerCase() === emailId) {
        return true;
      }
    }

    return false;
  }

  getTimeRangeEmailId(timeUnit) {
    // Report emails are unsubscribed as "{templateSlug}_{timeUnit}".
    // TODO: The 'timerange' part of this emailId should be returned from the server as part of an app config.
    return `timerange_${timeUnit}`.toLowerCase();
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
    this.profile.errors = [];
    try {
      await this.UserService.update({ id: this.user._id }, {
        first_name: this.profile.inputs.firstName,
        last_name: this.profile.inputs.lastName,
      }).$promise;
    } catch (err) {
      if(err.data.error) {
        this.profile.errors.push({ message: err.data.error });
      } else {
        this.profile.errors.push({ message: 'Error saving data.' });
      }
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
    const unsubscribedEmails = [];
    if(!this.email.inputs.shiftReportEnabled) {
      unsubscribedEmails.push(this.getTimeRangeEmailId(TimeUnit.Shift));
    }
    if(!this.email.inputs.weekReportEnabled) {
      unsubscribedEmails.push(this.getTimeRangeEmailId(TimeUnit.Week));
    }
    if(!this.email.inputs.monthReportEnabled) {
      unsubscribedEmails.push(this.getTimeRangeEmailId(TimeUnit.Month));
    }

    // Track unsubscribes in analytics (only log the events after the user update succeeds).
    const newlyUnsubscribedEmailIds = [];
    unsubscribedEmails.forEach(emailId => {
      if(!this.user.unsubscribed_emails || !this.user.unsubscribed_emails.includes(emailId)) {
        newlyUnsubscribedEmailIds.push(emailId);
      }
    });

    this.email.isSaving = true;
    this.email.errors = [];
    try {
      await this.UserService.update({ id: this.user._id }, {
        unsubscribed_emails: unsubscribedEmails.join(','),
      }).$promise;
    } catch (err) {
      if(err.data.error) {
        this.email.errors.push({ message: err.data.error });
      } else {
        this.email.errors.push({ message: 'Error saving data.' });
      }
      return;
    } finally {
      this.email.isSaving = false;
    }

    // Log unsubscribe events.
    newlyUnsubscribedEmailIds.forEach(emailId => {
      this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
        app: 'User Settings',
        action: 'unsubscribed email',
        emailId,
      });
    });

    // Update local user data.
    this.user.unsubscribed_emails = unsubscribedEmails.join(',');

    this.email.showSaved = true;
    form.$setPristine(true);
  }

  emailHasChanges() {
    return (
      this.email.inputs.shiftReportEnabled !== this.isUserUnsubscribedToReportType(TimeUnit.Shift) ||
      this.email.inputs.weekReportEnabled !== this.isUserUnsubscribedToReportType(TimeUnit.Week) ||
      this.email.inputs.monthReportEnabled !== this.isUserUnsubscribedToReportType(TimeUnit.Month)
    );
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
    this.password.errors = [];
    try {
      await this.UserService.changePassword({ id: this.user._id }, {
        username: this.user.username,
        oldPassword: this.password.inputs.currentPassword,
        newPassword: this.password.inputs.newPassword,
      }).$promise
    } catch (err) {
      if(err.data.password) {
        this.password.errors.push({ message: err.data.password });
      } else if(err.data.error) {
        this.password.errors.push({ message: err.data.error });
      } else {
        this.password.errors.push({ message: 'Error saving data.' });
      }
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
