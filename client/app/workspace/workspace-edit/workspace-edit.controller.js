'use strict';

import 'parsleyjs';

let _;

export default class WorkspaceEditController {
  workspace = {};
  errors = [];
  message = '';
  seed = true;
  isShowingAddDashboardsOverlay = false;

  /*@ngInject*/
  constructor(
    Workspace, User, $state, $stateParams, AmplitudeService, AnalyticEventNames, currentPrincipal, Modal, KibanaService,
  )
  {
    this.WorkspaceService = Workspace;
    this.UserService = User;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.currentPrincipal = currentPrincipal;
    this.Modal = Modal;
    this.KibanaService = KibanaService;

    this.palette = [['#00A9DA', '#0099c2', '#16a2b3', '#1fc8a7', '#334A56', '#697983'],
                    ['#30b370', '#d61745', '#efb93d', '#9068bc', '#e09061', '#d6527e']];

    this.inputWorkspace = {
      _id: this.$stateParams.id === 'new' ? undefined : this.$stateParams.id,
      color: this.palette[0][0],
      dashboards: {},
    };
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();
    this.workspaceForm = $('#workspace-form').parsley();
    await this.refresh();
  }

  get isNewWorkspace() {
    return (this.inputWorkspace._id == null);
  }

  get pageTitle() {
    if(!this.inputWorkspace) {
      return undefined;
    } else {
      return this.isNewWorkspace ? 'New Workspace' : 'Edit Workspace';
    }
  }

  get saveButtonText() {
    if(!this.inputWorkspace) {
      return undefined;
    } else {
      return this.isNewWorkspace ? 'Create' : 'Save';
    }
  }

  get savingText() {
    if(!this.inputWorkspace) {
      return undefined;
    } else {
      return this.isNewWorkspace ? 'Creating...' : 'Saving...';
    }
  }

  async refresh() {
    this.isLoading = true;

    this.origWorkspace = {};

    if(this.inputWorkspace._id) {
      this.origWorkspace = await this.WorkspaceService.get({ id: this.inputWorkspace._id }).$promise;
      this.inputWorkspace = _.cloneDeep(this.origWorkspace);
    }
    const departmentUsers = await this.UserService.query().$promise;

    this.seed = this.isNewWorkspace;

    const users = _.filter(departmentUsers, u => !u.isAdmin && !u.isGlobal && u.isDashboardUser);
    this.inputUsers = _.values(_.merge(
      _.keyBy(users, 'username'),
      _.keyBy(this.inputWorkspace.users, 'username')
    ));
    const me = _.find(this.inputUsers, u => u.username === this.currentPrincipal.username);
    // default permissions
    if(me) {
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
    if(user) {
      user.is_owner = true;
      user.permission = 'admin';
    }
    form.$setDirty(true);
  }

  async revokeOwnership(form, inputUser) {
    const user = _.find(this.inputUsers, u => u._id === inputUser._id);
    if(user) user.is_owner = false;
    form.$setDirty(true);
  }

  saveDisabled() {
    return this.isSaving;
    // if(this.isSaving) {
    //   return true;
    // }

    // console.log(this.inputWorkspace.name);
    //
    // if(this.isNewWorkspace) {
    //   return (!this.inputWorkspace.name || !this.inputWorkspace.description);
    // }
    //
    // if (!this.origWorkspace || !this.inputWorkspace) {
    //   return true;
    // }
    //
    // if (this.origWorkspace.name !== this.inputWorkspace.name ||
    //   this.origWorkspace.description !== this.inputWorkspace.description ||
    //   `${this.origWorkspace.color}`.toLowerCase() !== `${this.inputWorkspace.color}`.toLowerCase()) {
    //   return false;
    // }
    //
    // if (this.inputUsers) {
    //   for (const user of this.inputUsers) {
    //     const origUser = _.find(this.origWorkspace.users, u => u._id === user._id);
    //     // user either was added as owner, or permissions given
    //     if (!origUser && (user.is_owner || user.permission)) {
    //       return false;
    //     }
    //     // user ownership or permission changed
    //     if (origUser && (user.is_owner !== origUser.is_owner || user.permission !== origUser.permission)) {
    //       return false;
    //     }
    //   }
    // }
    //
    // return true;
  }

  async updateWorkspace(form) {
    if(!this.workspaceForm.isValid()) {
      return;
    }

    let fnc = this.WorkspaceService.update;

    const params = {
      id: this.inputWorkspace._id
    };

    if(this.isNewWorkspace) {
      fnc = this.WorkspaceService.create;

      this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
        app: 'WORKSPACE',
        action: 'create',
        with_fixtures: this.seed,
      });
    }

    this.isSaving = true;
    this.errors = {};
    try {
      const workspace = await fnc(params, {
        id: this.inputWorkspace._id,
        name: this.inputWorkspace.name,
        description: this.inputWorkspace.description,
        color: this.inputWorkspace.color,
        dashboardIds: Object.keys(this.inputWorkspace.dashboards).join(','),
        users: this.inputUsers,
      }).$promise;

      await this.KibanaService.refreshAuth({ workspaceId: workspace._id });
    } catch (err) {
      if (err.data) {
        err = err.data;
      }
      console.error(err);
      // this.errors = err.errors;
      // if (this.errors) {
      //   // clean up validation error
      //   const hasNameError = !!this.errors.find(e => e.message === 'name must be unique');
      //   if(hasNameError) {
      //     this.errors = [{
      //       message: 'This name is already in use by someone in your department! Please choose another.'
      //     }]
      //   }
      //   this.showErrors = true;
      // }
      return;
    } finally {
      this.isSaving = false;
    }

    this.$state.go('site.workspace.home');
  }

  showUserAccessInfo() {
    this.Modal.alert({
      title: 'User Access',
      content: $('#userAccessInfo')[0].innerHTML,
    }).present();
  }

  showAddDashboardsOverlay() {
    this.isShowingAddDashboardsOverlay = true;
  }

  handleAddDashboardsOverlayConfirm({ selectedDashboards }) {
    this.inputWorkspace.dashboards = Object.assign(this.inputWorkspace.dashboards, selectedDashboards);
  }

  removeDashboard(dashboard) {
    delete this.inputWorkspace.dashboards[dashboard._id];
  }
}
