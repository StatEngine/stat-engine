'use strict';

import angular from 'angular';
// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';

let _;

export default class WorkspaceEditController {
  workspace = {};
  errors = {
    error: undefined
  };
  message = '';
  submitted = false;

  /*@ngInject*/
  constructor(Workspace, Modal, currentWorkspace, $state, AmplitudeService, AnalyticEventNames) {
    this.WorkspaceService = Workspace;
    this.ModalService = Modal;

    this.palette = [['#00A9DA', '#0099c2', '#16a2b3', '#1fc8a7', '#334A56', '#697983'],
                    ['#30b370', '#d61745', '#efb93d', '#9068bc', '#e09061', '#d6527e']];
    this.workspace = currentWorkspace || {
      color: this.palette[0][0],
    };
    this.$state = $state;
    this.seed = this.workspace._id == undefined;

    this.title = this.workspace._id ? 'Edit Workspace' : 'New Workspace';
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
  }

  async $onInit() {
    this.form = $('#workspace-form').parsley();
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  updateWorkspace(form) {
    this.submitted = true;

    if(this.form.isValid()) {
      let fnc = this.WorkspaceService.update;

      let params = {
        id: this.workspace._id
      };

      if(!this.workspace._id) {
        fnc = this.WorkspaceService.create;

        if (this.seed) {
          params.seedVisualizations = true;
          params.seedDashboards = true;
        }

        this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
          app: 'WORKSPACE',
          action: 'create',
          with_fixtures: this.seed,
        });
      }

      fnc(params, {
        id: this.workspace._id,
        name: this.workspace.name,
        description: this.workspace.description,
        color: this.workspace.color,
      }).$promise
        .then((saved) => {
          this.ModalService.custom({
            title: 'Workspaces Saved',
            content: 'Workspace has been saved!<br>  Would you like to manage user access now?',
            showCloseButton: false,
            enableBackdropDismiss: false,
            buttons: [{
              text: 'Skip',
              style: this.ModalService.buttonStyle.outlineInverseAlt,
              onClick: async () => {
                this.$state.go('site.workspace.home');
              },
            }, {
              text: 'Manage Users',
              style: this.ModalService.buttonStyle.primary,
              onClick: async () => {
                console.dir('in here')
                this.$state.go('site.workspace.edit.users', { id: saved._id});
              },
            }],
          }).present();
        })
        .catch(err => {
          console.dir(err)
          err = err.data;
          this.errors = err.errors;
          // clean up validation error
          let nameError = _.filter(this.errors, m => m.message === 'name must be unique');
          if(nameError) {
            this.errors = [{
              message: 'This name is already in use! Please choose another.'
            }]
          }
        });
    }
  }
}