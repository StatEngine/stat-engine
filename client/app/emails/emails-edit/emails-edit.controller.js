'use strict';

import angular from 'angular';
// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';
import randomstring from 'randomstring';
import { getErrors } from '../../../util/error';

let _;

export default class EmailsEditController {
  errors = null;
  message = '';
  seed = true;

  /*@ngInject*/
  constructor(
    CustomEmail, User, $state, $stateParams, AmplitudeService, AnalyticEventNames, currentPrincipal, Modal, FixtureTemplate,
  ) {
    this.CustomEmailService = CustomEmail;
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

    this.inputEmail = {
      _id: this.$stateParams.id === 'new' ? undefined : this.$stateParams.id,
      color: this.palette[0][0],
    };
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();
    this.emailForm = $('#email-form').parsley();
    await this.refresh();
  }

  get isNewEmail() {
    return (this.inputEmail._id == null);
  }

  get pageTitle() {
    if (!this.inputEmail) {
      return undefined;
    }
    return this.isNewEmail ? 'New Email' : 'Edit Email';
  }

  get saveButtonText() {
    if (!this.inputEmail) {
      return undefined;
    }
    return this.isNewEmail ? 'Create' : 'Save';
  }

  get savingText() {
    if (!this.inputEmail) {
      return undefined;
    }
    return this.isNewEmail ? 'Creating...' : 'Saving...';
  }

  async refresh() {
    this.isLoading = true;

    this.origEmail = {};

    if (!this.isNewEmail) {
      this.origEmail = await this.EmailService.get({ id: this.inputEmail._id }).$promise;
      // Clone email for editing.
      this.inputEmail = _.cloneDeep(this.origEmail);
    }

    const departmentUsers = await this.UserService.query().$promise;

    this.seed = this.isNewEmail;

    const users = _.filter(departmentUsers, u => !u.isAdmin && !u.isGlobal && u.isDashboardUser);
    this.inputUsers = _.values(_.merge(
      _.keyBy(users, 'username'),
      _.keyBy(this.inputEmail.users, 'username'),
    ));
    const me = _.find(this.inputUsers, u => u.username === this.currentPrincipal.username);
    // default permissions
    if (me) {
      me.is_owner = true;
      me.permission = 'admin';
    }
    this.isLoading = false;
  }

  saveDisabled() {
    return this.isSaving;
  }

  async updateEmail() {
    if (!this.emailForm.isValid()) {
      return;
    }

    let fnc = this.EmailService.update;

    const params = {
      id: this.inputEmail._id,
    };

    if (this.isNewEmail) {
      fnc = this.EmailService.create;

      this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
        app: 'EMAIL',
        action: 'create',
        with_fixtures: this.seed,
      });
    }

    this.isSaving = true;
    this.errors = null;
    try {
      await fnc(params, {
        id: this.inputEmail._id,
        name: this.inputEmail.name,
        description: this.inputEmail.description,
        color: this.inputEmail.color,
      }).$promise;
    } catch (err) {
      this.errors = getErrors(err);
      return;
    } finally {
      this.isSaving = false;
    }

    this.$state.go('site.emails.home');
  }

  templateIdToUniqueId(templateId) {
    // This has to exactly match FixtureTemplate.templateIdToUniqueId() on the server, since the
    // template id needs to be extracted using FixtureTemplate.uniqueIdToTemplateId().
    return `${templateId}--${randomstring.generate(8)}`;
  }
}
