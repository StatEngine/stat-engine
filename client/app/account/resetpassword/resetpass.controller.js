'use strict';

export default class ResetPasswordController {
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
  * Sends a password reset email.
  */
  resetPassword(form) {
    this.submitted = true;
    if(form.$valid) {
      this.UserService.resetPassword({}, { useremail: this.user.email }).$promise
        .then(() => {
          this.Modal.custom({
            title: 'Email Sent',
            content: "An email was sent with instructions to reset your password. Remember to check your spam if you don't see the email after a while.",
            buttons: [{
              text: 'Sign In',
              style: this.Modal.buttonStyle.primary,
              onClick: () => this.$state.go('site.account.login'),
            }],
          }).present();
        })
        .catch(err => {
          if(err.data.error) this.errors.email = err.data.error;
          else this.errors.email = 'There was an error sending email. ';
          form.email.$setValidity('mongoose', false);
        });
    }
  }
}
