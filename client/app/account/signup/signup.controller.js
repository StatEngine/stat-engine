'use strict';

// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';

export default class SignupController {
  user = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  };
  errors = {};
  submitted = false;

  /*@ngInject*/
  constructor(User, $state, fireDepartments, AmplitudeService, AnalyticEventNames) {
    this.UserService = User;
    this.$state = $state;
    this.fireDepartments = fireDepartments;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
  }

  $onInit() {
    this.form = $('#workspace-form').parsley();
  }

  register() {
    this.submitted = true;

    if(this.form.isValid()) {
      this.UserService.create({
        username: this.user.username,
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        password: this.user.password,
        nfors: true,
        requested_fire_department_id: this.user.requested_fire_department_id ? this.user.requested_fire_department_id._id : undefined,
      }).$promise
        .then(() => {
          // Account created, redirect to home
          this.AmplitudeService.track(this.AnalyticEventNames.SIGNED_UP, this.user);

          this.$state.go('site.account.login');
        })
        .catch(err => {
          err = err.data;
          this.errors = err.errors;
          console.dir(this.errors);
        });
    }
  }
}
