'use strict';

import angular from 'angular';
// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';

export default class WorkspaceEditController {
  workspace = {};
  errors = {
    error: undefined
  };
  message = '';
  submitted = false;

  /*@ngInject*/
  constructor(Workspace, Modal, currentWorkspace, $state) {
    this.WorkspaceService = Workspace;
    this.ModalService = Modal;

    this.palette = [['#00A9DA', '#0099c2', '#16a2b3', '#1fc8a7', '#334A56', '#697983'],
                    ['#30b370', '#d61745', '#efb93d', '#9068bc', '#e09061', '#d6527e']];
    this.workspace = currentWorkspace || {
      color: this.palette[0][0],
    };
    this.$state = $state;
  }


  $onInit() {
    this.form = $('#workspace-form').parsley();
  }

  updateWorkspace(form) {
    this.submitted = true;

    if(this.form.isValid()) {
      let fnc = this.WorkspaceService.update;

      if (this.workspace._id === 'new') fnc = this.WorkspaceService.save;

      fnc({ id: this.workspace._id}, {
        id: this.workspace._id,
        name: this.workspace.name,
        description: this.workspace.description,
        color: this.workspace.color,
      }).$promise
        .then((saved) => {
          console.dir(saved)
          this.$state.go('site.workspace.edit.users', { id:saved._id});
        })
        .catch(err => {
          err = err.data;
          this.errors = err.errors;
        });
    }
  }
}