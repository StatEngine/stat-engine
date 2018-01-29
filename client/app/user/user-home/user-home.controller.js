'use strict';

export default class UserHomeController {
  /*@ngInject*/
  constructor(currentPrincipal) {
    this.principal = currentPrincipal;
    console.dir(this.principal)
  }
}
