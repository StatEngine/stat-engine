'use strict';

// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';

export default class UserSettingsController {
  user = {
    first_name: '',
    last_name: '',
    error: ''
  };
  passwordErrors = [];
  submitted = false;

  /*@ngInject*/
  constructor(User, $state, currentPrincipal) {
    this.user = currentPrincipal;
    this.UserService = User;
    this.$state = $state;
    this.saved = false;
    this.savedPassword = false;
  }

  $onInit() {
    this.profileForm = $('#profileForm').parsley();
    this.passwordForm = $('#passwordForm').parsley();
  }

  edituser(form) {
    this.submitted = true;

    this.saved = false;

    if(this.profileForm.isValid()) {
      this.saved = false;
      this.UserService.update({ id: this.user._id }, {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        username: this.user.username,
      }).$promise
        .then(() => {
          this.errors = {};
          this.saved = true;
          form.$setPristine(true);
        })
        .catch(err => {
          if(err.data.error) this.errors.error = err.data.error;
          else this.errors.error = 'Error saving data.';
        });
    }
  }

  changePassword(form) {
    this.submitted = true;

    this.savedPassword = false;

    if(this.passwordForm.isValid()) {
      this.passwordErrors = [];
      this.UserService.changePassword({ id: this.user._id }, { username: this.user.username, oldPassword: this.user.oldPassword, newPassword: this.user.newPassword }).$promise
        .then(() => {
          // Logged in, redirect to user home
          this.savedPassword = true;
          form.$setPristine(true);
        })
        .catch(err => {
          if(err.data.password) {
            this.passwordErrors.push({ message: err.data.password });
          } else if(err.data.error) {
            this.passwordErrors.push({ message: err.data.error });
          } else {
            this.passwordErrors.push({ message: 'Error saving data.' });
          }
        });
    }
  }
}
