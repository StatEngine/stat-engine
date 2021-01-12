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

  /* @ngInject */
  constructor(CustomEmail, EmailList, User, $state, $stateParams, AmplitudeService, AnalyticEventNames, currentPrincipal, Modal, FixtureTemplate, $window, $document) {
    this.CustomEmailService = CustomEmail;
    this.EmailListService = EmailList;
    this.UserService = User;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.currentPrincipal = currentPrincipal;
    this.Modal = Modal;
    this.FixtureTemplate = FixtureTemplate;
    this.$window = $window;
    this.$document = $document;

    this.palette = [['#00A9DA', '#0099c2', '#16a2b3', '#1fc8a7', '#334A56', '#697983'],
      ['#30b370', '#d61745', '#efb93d', '#9068bc', '#e09061', '#d6527e']];

    this.allSections = [
      {
        type: 'agencyIncidentTypeSummary',
        label: 'Agency Incident Type Summary',
        selected: false,
      },
      {
        type: 'agencySummary',
        label: 'Agency Summary',
        selected: false,
      },
      {
        type: 'alertSummary',
        label: 'Alert Summary',
        selected: false,
      },
      {
        type: 'battalionSummary',
        label: 'Battalion Summary',
        selected: false,
      },
      {
        type: 'incidentSummary',
        label: 'Incident Summary',
        selected: false,
      },
      {
        type: 'incidentTypeSummary',
        label: 'Incident Type Summary',
        selected: false,
      },
      {
        type: 'jurisdictionSummary',
        label: 'Jurisdiction Summary',
        selected: false,
      },
      {
        type: 'unitSummary',
        label: 'Unit Summary',
        selected: false,
      },
    ];

    this.inputEmail = {
      _id: this.$stateParams.id === 'new' ? undefined : this.$stateParams.id,
      name: '',
      description: '',
      schedule: '',
      enabled: false,
      by_shift: false,
      sections: [],
      email_list: [],
    };

    this.previewHtml = '';
    this.selectedSections = [];
    this.deptEmails = [];
    this.selectedEmails = [];
    this.chooseRecipients = false;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    console.dir(this.CustomEmailService);

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
      this.origEmail = await this.CustomEmailService.get({ id: this.inputEmail._id }).$promise;
      // Clone email for editing.
      this.inputEmail = _.cloneDeep(this.origEmail);
    }

    this.selectedSections = this.inputEmail.sections.map(s => s.type);
    this.byShift = this.inputEmail.schedule === 'by shift';
    const resEmailList = await this.EmailListService.emailList().$promise;

    this.deptEmails = resEmailList.deptEmails.map(de => ({
      email: de,
      selected: this.inputEmail.email_list.findIndex(se => se === de) > -1,
    }));

    console.log('DEPT EMAILS');
    console.dir(this.deptEmails);

    // other stuff
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

  handleShift() {
    if (this.inputEmail.by_shift) {
      this.inputEmail.schedule = 'by shift';
    } else {
      this.inputEmail.schedule = '';
    }
  }

  showScheduleHelp() {
    this.Modal.alert({
      title: 'Schedule Help',
      content: $('#scheduleHelpModal')[0].innerHTML,
    }).present();
  }

  getSections() {
    return this.selectedSections.map(value => ({ type: value }));
  }

  getEmailList() {
    if (this.chooseRecipients) {
      return this.selectedEmails.map(se => se.email);
    }
    return this.deptEmails.map(de => de.email);
  }

  async getPreview() {
    const getPreviewFunc = this.CustomEmailService.preview;
    const params = { id: this.inputEmail._id };
    const sectionsJson = this.getSections();
    this.inputEmail.sections = sectionsJson;
    const resPreview = await getPreviewFunc(params, this.inputEmail).$promise;
    this.previewHtml = resPreview.html;
    const tab = window.open('about:blank', '_blank');
    tab.document.write(this.previewHtml);
    tab.document.close();
  }

  async updateEmail() {
    if (!this.emailForm.isValid()) {
      return;
    }

    let fnc = this.CustomEmailService.update;
    const params = { id: this.inputEmail._id };

    if (this.isNewEmail) {
      fnc = this.CustomEmailService.create;

      // this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
      //   app: 'EMAIL',
      //   action: 'create',
      //   with_fixtures: this.seed,
      // });
    }

    this.isSaving = true;
    this.errors = null;
    this.inputEmail.sections = this.getSections();
    this.inputEmail.email_list = this.getEmailList();

    try {
      await fnc(params, this.inputEmail).$promise;
    } catch (err) {
      console.log('error calling api');
      console.dir(err);
      this.errors = getErrors(err);
      return;
    } finally {
      this.isSaving = false;
    }

    // this.$state.go('site.emails.home');
  }

  setScheduleAt() {
    this.inputEmail.schedule = 'at 8 am';
  }

  setScheduleEvery() {
    this.inputEmail.schedule = 'every 4 hours';
  }

  templateIdToUniqueId(templateId) {
    // This has to exactly match FixtureTemplate.templateIdToUniqueId() on the server, since the
    // template id needs to be extracted using FixtureTemplate.uniqueIdToTemplateId().
    return `${templateId}--${randomstring.generate(8)}`;
  }
}
