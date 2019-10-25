'use strict';

import angular from 'angular';
// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';
import { getErrors } from '../../../util/error';

let _;
export default class WorkspaceEditController {
  workspace = {};
  errors = null;
  message = '';
  seed = true;

  /*@ngInject*/
  constructor(Workspace, User, $state, $stateParams, AmplitudeService, AnalyticEventNames, currentPrincipal, Modal) {
    this.WorkspaceService = Workspace;
    this.UserService = User;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.currentPrincipal = currentPrincipal;
    this.Modal = Modal;

    this.palette = [['#00A9DA', '#0099c2', '#16a2b3', '#1fc8a7', '#334A56', '#697983'],
                    ['#30b370', '#d61745', '#efb93d', '#9068bc', '#e09061', '#d6527e']];

    this.inputWorkspace = {
      _id: this.$stateParams.id === 'new' ? undefined : this.$stateParams.id,
      color: this.palette[0][0],
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

  get pageTitle() {
    if(!this.inputWorkspace) {
      return undefined;
    } else {
      return this.inputWorkspace._id ? 'Edit Workspace' : 'New Workspace';
    }
  }

  get saveButtonText() {
    if(!this.inputWorkspace) {
      return undefined;
    } else {
      return this.inputWorkspace._id ? 'Save' : 'Create';
    }
  }

  get savingText() {
    if(!this.inputWorkspace) {
      return undefined;
    } else {
      return this.inputWorkspace._id ? 'Saving...' : 'Creating...';
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

    this.seed = this.inputWorkspace._id == undefined;

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
    if(this.isSaving) {
      return true;
    }

    let noChanges = true;
    let noUserChanges = true;
    if (!this.origWorkspace || !this.inputWorkspace) {
      return true;
    }
    if (this.origWorkspace.name !== this.inputWorkspace.name ||
        this.origWorkspace.description !== this.inputWorkspace.description ||
        this.origWorkspace.color !== this.inputWorkspace.color) {
      noChanges = false;
    }

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
    if(!this.workspaceForm.isValid()) {
      return;
    }

    let fnc = this.WorkspaceService.update;

    const params = {
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
    this.errors = null;
    try {
      await fnc(params, {
        id: this.inputWorkspace._id,
        name: this.inputWorkspace.name,
        description: this.inputWorkspace.description,
        color: this.inputWorkspace.color,
        users: this.inputUsers,
      }).$promise;
    } catch (err) {
      this.errors = getErrors(err);
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
}
