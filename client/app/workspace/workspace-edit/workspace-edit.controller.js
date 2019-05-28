'use strict';

import angular from 'angular';
// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';

let _;
let tippy;
export default class WorkspaceEditController {
  workspace = {};
  errors = {
    error: undefined
  };
  message = '';
  submitted = false;

  /*@ngInject*/
  constructor(Workspace, Modal, currentWorkspace, $state, AmplitudeService, AnalyticEventNames, User) {
    this.WorkspaceService = Workspace;
    this.UserService = User;
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

   async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
    tippy = await import(/* webpackChunkName: "tippy" */ 'tippy.js');
    tippy = tippy.default;
  }

  async $onInit() {
    await this.loadModules();
    this.form = $('#workspace-form').parsley();
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
    await this.refresh();
    this.initTippy();
  }

  async refresh() {
    this.isLoading = true;
    const departmentUsers = await this.UserService.query().$promise;
    let workspaceUsers = [];
    if(this.workspace._id) {
      workspaceUsers = _.filter(this.workspace.Users, u => !u.isAdmin && !u.isGlobal && u.isDashboardUser);
    }
    const users = _.filter(departmentUsers, u => !u.isAdmin && !u.isGlobal && u.isDashboardUser);
    this.users = _.values(_.merge(
      _.keyBy(users, 'username'),
      _.keyBy(this.workspace.Users, 'username')
    ));
    this.isLoading = false;
  }

  initTippy() {
    console.dir(tippy);

    tippy('.tippy', {
      allowTitleHTML: true,
      interactive: true,
      delay: 150,
      arrow: true,
      arrowType: 'sharp',
      theme: 'statengine',
      duration: 250,
      animation: 'shift-away',
      maxWidth: '750px',
      inertia: false,
      touch: true,
    });
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
            title: 'Workspace Created',
            content: 'Would you like to manage user access now?',
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
