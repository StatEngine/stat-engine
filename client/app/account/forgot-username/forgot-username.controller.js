'use strict';

export default class ForgotUsernameController {
  user = {
    email: ''
  };
  errors = {
    email: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(User, $state, Modal) {
    this.UserService = User;
    this.$state = $state;
    this.Modal = Modal;
  }

  /**
   * Sends a username request email.
   */
  requestUsername(form) {
    this.submitted = true;
    if(form.$valid) {
      this.UserService.requestUsername({}, { useremail: this.user.email }).$promise
        .then(() => {
          this.Modal.custom({
            title: 'Email Sent',
            content: "An email was sent with your username. Remember to check your spam if you don't see the email after a while.",
            buttons: [{
              text: 'Sign In',
              style: this.Modal.buttonStyle.primary,
              onClick: () => this.$state.go('site.account.login'),
            }],
          }).present();
        })
        .catch(err => {
          if(err.data && err.data.errors) {
            this.errors = err.data.errors;
          } else {
            this.errors = [{ message: 'An error occurred.' }];
          }
        });
    }
  }
}
