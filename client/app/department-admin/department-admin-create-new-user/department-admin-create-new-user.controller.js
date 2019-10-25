'use strict';

// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';
import generator from 'generate-password';

export default class DepartmentAdminCreateNewUserController {
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
  constructor(User, $state, AmplitudeService, AnalyticEventNames, currentPrincipal, Modal) {
    this.UserService = User;
    this.$state = $state;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.Modal = Modal;
  }

  $onInit() {
    this.form = $('#signup-form').parsley();
  }

  register() {
    this.submitted = true;

    if(this.form.isValid()) {
      this.UserService.create({
        username: this.user.username,
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        password: this.generatePassword(),
        nfors: true,
        fire_department_id: 25035 || this.fireDepartment._id,
        new_user_by_department_admin: true,
      }).$promise
        .then(() => {
          // Account created, redirect to home
          this.AmplitudeService.track(this.AnalyticEventNames.SIGNED_UP, this.user);
          this.showModal();
        })
        .catch(err => {
          err = err.data;
          this.errors = err.errors;
          console.dir(this.errors);
        });
    }
  }

  generatePassword() {
    return generator.generate({
      length: 10,
      numbers: true
    });
  }

  showModal() {
    this.Modal.custom({
      title: 'Email Sent',
      content: "An email was sent to the newly registered user with instructions to login.",
      buttons: [{
        text: 'Ok',
        style: this.Modal.buttonStyle.primary,
        onClick: () => this.$state.go('site.departmentAdmin.home'),
      }],
    }).present();
  }
}
