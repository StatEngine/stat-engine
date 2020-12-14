'use strict';

export default class EmailsSelectController {
  /* @ngInject */
  constructor($window, $state, currentPrincipal, User, AmplitudeService, AnalyticEventNames, Modal, CustomEmail) {
    this.$window = $window;
    this.$state = $state;
    this.currentPrincipal = currentPrincipal;

    this.UserService = User;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.ModalService = Modal;
    this.CustomEmailService = CustomEmail;
    this.emails = [];
    this.isLoading = false;

    this.refresh();
  }

  $onInit() {
    $('.dropdown-button').dropdown();
  }

  refresh() {
    this.isLoading = true;
    this.CustomEmailService.listByDeptId().$promise
      .then(resEmail => {
        this.emails = resEmail.emails;
        this.isLoading = false;
      })
      .catch();
  }

  select(e, email) {
    // HACK: Ignore events that occurred in the dropdown.
    if (e.originalEvent.dropdownClick) {
      return;
    }

    // this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
    //   app: 'EMAILS',
    //   emails: email.name,
    // });
    this.$state.go('site.emails.edit', { id: email._id });
  }

  dropdownClick(e) {
    // HACK: For some reason e.stopPropagation() makes Bootstrap dropdowns act glitchy,
    // so we have to use this silly workaround to manually prevent propagation.
    e.originalEvent.dropdownClick = true;
  }

  editEmail(email) {
    this.$state.go('site.emails.edit', { id: email._id });
  }

  deleteEmail(email) {
    this.ModalService.custom({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this email?',
      onDismiss: () => console.log('Dismiss'),
      buttons: [{
        text: 'Cancel',
        style: this.ModalService.buttonStyle.outlineInverseAlt,
        onClick: async () => {},
      }, {
        text: 'Delete',
        style: this.ModalService.buttonStyle.danger,
        onClick: async () => {
          console.log('Delete Email');
          this.CustomEmailService.delete({ id: email._id })
            .$promise.then(() => this.refresh());
        },
      }],
    }).present();
  }
}
