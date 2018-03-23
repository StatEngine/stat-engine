'use strict';

export default class EditDeptController {
  user = {
    username: '',
    role: ''
  };

  errors = {
    editdept: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(Principal, $state, currentPrincipal) {
    this.user = currentPrincipal;
    this.Principal = Principal;
    this.$state = $state;
  }

  editdept(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Principal.editdept({
        username: this.user.username,
        role: this.user.role
      })
        .then(() => {
          // Logged in, redirect to user home
          this.$state.go('site.user.home');
        })
        .catch(err => {
          this.errors.login = err.data.message;
        });
    }
  }
}
