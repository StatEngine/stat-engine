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
  constructor(Workspace, User, $state, $stateParams, AmplitudeService, AnalyticEventNames, currentPrincipal) {
    this.WorkspaceService = Workspace;
    this.UserService = User;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.currentPrincipal = currentPrincipal;

    this.palette = [['#00A9DA', '#0099c2', '#16a2b3', '#1fc8a7', '#334A56', '#697983'],
                    ['#30b370', '#d61745', '#efb93d', '#9068bc', '#e09061', '#d6527e']];

    this.inputWorkspace = {
      color: this.palette[0][0],
    };
  }

   async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
    tippy = await import(/* webpackChunkName: "tippy" */ 'tippy.js');
    tippy = tippy.default;
  }

  async $onInit() {
    await this.loadModules();
    this.workspaceForm = $('#workspace-form').parsley();
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
    await this.refresh();
    this.initTippy();
  }

  async refresh() {
    this.isLoading = true;

    this.origWorkspace = {};

    if(this.$stateParams.id !== 'new') {
      this.origWorkspace = await this.WorkspaceService.get({ id: this.$stateParams.id }).$promise;
      this.inputWorkspace = _.cloneDeep(this.origWorkspace);
    }
    const departmentUsers = await this.UserService.query().$promise;

    this.seed = this.inputWorkspace._id == undefined;
    this.title = this.inputWorkspace._id ? 'Edit Workspace' : 'New Workspace';

    const users = _.filter(departmentUsers, u => !u.isAdmin && !u.isGlobal && u.isDashboardUser);
    this.inputUsers = _.values(_.merge(
      _.keyBy(users, 'username'),
      _.keyBy(this.inputWorkspace.users, 'username')
    ));
    const me = _.find(this.inputUsers, u => u.username === this.currentPrincipal.username);
    // default permissions
    if (me) {
      me.is_owner = true;
      me.permission = 'admin';
    }
    this.isLoading = false;
  }

  async grantPermission(form, inputUser, level) {
    const user = _.find(this.inputUsers, u => u._id === inputUser._id);
    if(user) user.permission = level;
    form.$setDirty(true);
  }

  async revokePermission(form, inputUser) {
    const user = _.find(this.inputUsers, u => u._id === inputUser._id);
    if(user) user.permission = null;
    form.$setDirty(true);
  }

  async grantOwnership(form, inputUser) {
    const user = _.find(this.inputUsers, u => u._id === inputUser._id);
    if(user) user.is_owner = true;
    form.$setDirty(true);
  }

  async revokeOwnership(form, inputUser) {
    const user = _.find(this.inputUsers, u => u._id === inputUser._id);
    if(user) user.is_owner = false;
    form.$setDirty(true);
  }

  initTippy() {
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


  saveDisabled() {
    let noChanges = true;
    let noUserChanges = true;
    if (!this.origWorkspace || !this.inputWorkspace) return true;
    if (this.origWorkspace.name !== this.inputWorkspace.name ||
        this.origWorkspace.description !== this.inputWorkspace.description ||
        this.origWorkspace.color !== this.inputWorkspace.color) noChanges = false;

    if (this.inputUsers) {
      this.inputUsers.forEach(u => {
        const origUser = _.find(this.origWorkspace.users, ou => ou._id === u._id);
        // user either was added as owner, or permissions given
        if (!origUser && (u.is_owner || u.permission)) {
          noUserChanges = false;
        }
        // user ownership or permission changed
        if (origUser && (u.is_owner !== origUser.is_owner || u.permission !== origUser.permission)) {
          noUserChanges = false;
        }
      });
    }

    return (
     (noChanges && noUserChanges) ||
     this.isSaving
    )
  }

  async updateWorkspace(form) {
    this.submitted = true;

    if(this.workspaceForm.isValid()) {
      let fnc = this.WorkspaceService.update;

      let params = {
        id: this.inputWorkspace._id
      };

      if(!this.inputWorkspace._id) {
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

      this.isSaving = true;
      await fnc(params, {
        id: this.inputWorkspace._id,
        name: this.inputWorkspace.name,
        description: this.inputWorkspace.description,
        color: this.inputWorkspace.color,
        users: this.inputUsers,
      }).$promise
        .then((saved) => {
          this.refresh();
          this.showSaved = true;
        })
        .catch(err => {
          err = err.data;
          this.errors = err.errors;
          // clean up validation error
          let nameError = _.filter(this.errors, m => m.message === 'name must be unique');
          if(nameError) {
            this.errors = [{
              message: 'This name is already in use! Please choose another.'
            }]
          }
        })
        .finally(() => {
          this.isSaving = false;
        })
        this.hasUserChanges = false;

        form.$setPristine(true);
    }
  }
}
