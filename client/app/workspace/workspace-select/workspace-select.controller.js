'use strict';

export default class WorkspaceSelectController {
  /*@ngInject*/
  constructor($window, $state, currentPrincipal, User, AmplitudeService, AnalyticEventNames, Modal, Workspace) {
    this.$window = $window;
    this.$state = $state;
    this.currentPrincipal = currentPrincipal;

    this.UserService = User;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.ModalService = Modal;
    this.WorkspaceService = Workspace;

    this.refresh();
  }

  $onInit() {
    $('.dropdown-button').dropdown();
  }

  refresh() {
    this.isLoading = true;
    this.UserService.get().$promise.then(user => {
      this.workspaces = user.workspaces;
      this.isLoading = false;
    });
  }

  select(e, workspace) {
    // HACK: Ignore events that occurred in the dropdown.
    if(e.originalEvent.dropdownClick) {
      return;
    }

    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
      app: 'WORKSPACE',
      workspace: workspace.name
    });
    this.$window.location.href = `/workspaces/${workspace._id}/dashboard`;
  }

  dropdownClick(e) {
    // HACK: For some reason e.stopPropagation() makes Bootstrap dropdowns act glitchy,
    // so we have to use this silly workaround to manually prevent propagation.
    e.originalEvent.dropdownClick = true;
  }

  editWorkspace(workspace) {
    this.$state.go('site.workspace.edit', { id: workspace._id});
  }

  deleteWorkspace(workspace) {
    this.ModalService.custom({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this workspace?<br><br><strong class="text-danger">All saved objects, such as dashboards and visualizations, will be deleted, and workspace users will no longer have access!</strong>',
      onDismiss: () => console.log('Dismiss'),
      buttons: [{
        text: 'Cancel',
        style: this.ModalService.buttonStyle.outlineInverseAlt,
        onClick: async () => {},
      }, {
        text: 'Delete',
        style: this.ModalService.buttonStyle.danger,
        onClick: async () => {
          this.WorkspaceService.delete({ id: workspace._id})
          .$promise.then(() => this.refresh());
        },
      }],
    }).present();
  }
}
