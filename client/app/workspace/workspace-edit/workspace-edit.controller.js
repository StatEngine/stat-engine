'use strict';

import angular from 'angular';
// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';
import randomstring from 'randomstring';
import { getErrors } from '../../../util/error';

let _;

export default class WorkspaceEditController {
  workspace = {};
  errors = null;
  message = '';
  seed = true;
  isShowingAddDashboardsOverlay = false;

  /*@ngInject*/
  constructor(
    Workspace, User, $state, $stateParams, AmplitudeService, AnalyticEventNames, currentPrincipal, Modal, FixtureTemplate,
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
    this.FixtureTemplate = FixtureTemplate;

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

    if (this.isNewWorkspace) {
      // Add all of the dashboards automatically by default.
      const dashboards = await this.FixtureTemplate.getDashboards().$promise;
      this.addDashboards(dashboards);
    } else {
      this.origWorkspace = await this.WorkspaceService.get({ id: this.inputWorkspace._id }).$promise;

      // Convert dashboards array to object.
      const dashboards = {};
      this.origWorkspace.dashboards.forEach(d => dashboards[d._id] = d);
      this.origWorkspace.dashboards = dashboards;

      // Clone workspace for editing.
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
  }

  async updateWorkspace() {
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
    this.errors = null;
    try {
      await fnc(params, {
        id: this.inputWorkspace._id,
        name: this.inputWorkspace.name,
        description: this.inputWorkspace.description,
        color: this.inputWorkspace.color,
        dashboards: this.inputWorkspace.dashboards,
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

  showAddDashboardsOverlay() {
    this.isShowingAddDashboardsOverlay = true;
  }

  handleAddDashboardsOverlayConfirm({ selectedDashboards }) {
    this.addDashboards(selectedDashboards);
  }

  templateIdToUniqueId(templateId) {
    // This has to exactly match FixtureTemplate.templateIdToUniqueId() on the server, since the
    // template id needs to be extracted using FixtureTemplate.uniqueIdToTemplateId().
    return `${templateId}--${randomstring.generate(8)}`;
  }

  addDashboards(dashboards) {
    // Build existing dashboard title lookup to avoid confusing duplicate titles.
    const dashboardTitlesLookup = {};
    Object.keys(this.inputWorkspace.dashboards).forEach(dashboardId => {
      const dashboard = this.inputWorkspace.dashboards[dashboardId];
      dashboardTitlesLookup[dashboard.title] = dashboard;
    });

    dashboards.forEach(dashboard => {
      // Generate a unique id so that we can add multiple of the same type of dashboard.
      // NOTE: The dashboard id will be regenerated on the backend during dashboard creation.
      dashboard._id = this.templateIdToUniqueId(dashboard._id);

      // Make sure we don't have any duplicate titles.
      const origTitle = dashboard.title;
      let count = 0;
      while (dashboardTitlesLookup[dashboard.title]) {
        count++;
        dashboard.title = `${origTitle} (${count})`;
      }

      this.inputWorkspace.dashboards[dashboard._id] = dashboard;
    });
  }

  removeDashboard(dashboard) {
    this.Modal.confirm({
      title: 'Remove Dashboard',
      content: `Are you sure you want to remove <strong>${dashboard.title}</strong>?`,
      confirmButtonStyle: this.Modal.buttonStyle.danger,
      confirmButtonText: 'Remove',
      showCloseButton: false,
      enableBackdropDismiss: false,
      onConfirm: () => {
        delete this.inputWorkspace.dashboards[dashboard._id];
      },
    }).present();
  }
}
