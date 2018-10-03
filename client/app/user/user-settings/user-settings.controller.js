'use strict';

import parsleyjs from 'parsleyjs';

export default class UserSettingsController {
  user = {
    first_name: '',
    last_name: '',
    error: ''
  };
  errors = {
    error: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(User, $state, currentPrincipal) {
    this.user = currentPrincipal;
    this.UserService = User;
    this.$state = $state;
    this.saved = false;
  }

  $onInit() {
    this.profileForm = $('#profileForm').parsley();
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
          this.saved = true;
          form.$setPristine(true);
          console.dir(form);
        })
        .catch(err => {
          console.dir(err)
          if(err.data.error) this.errors.error = err.data.error;
          else this.errors.error = 'Error saving data.';
        });
    }
  }
}
