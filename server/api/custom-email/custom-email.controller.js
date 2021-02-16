/* eslint-disable camelcase */
import moment from 'moment';

import { Extension, ExtensionConfiguration } from '../../sqldb';
import CustomEmailScheduler from '../../lib/emails/customEmailScheduler';
import getEmailHtml from '../email/getEmailHtmlController';
import getFireDepartment from '../../lib/emails/fireDepartment';
import getPreviewData from './preview';
import { create as createCustomEmail, destroy, findAll, findOne, update } from './custom-email.service';

// gets all custom emails for a given fire dept id
// used for the list page of the webapp
export async function listByDeptId(req, res) {
  const fdId = req.user.dataValues.FireDepartment.dataValues.fd_id;
  const where = { fd_id: fdId };
  const emails = await findAll(where);
  res.json({ emails });
}

export async function find(req, res) {
  const { emailId } = req.params;
  const email = await findOne(emailId);
  res.json(email);
}

export async function create(req, res) {
  const { body } = req;
  const { name, description, schedule, enabled, by_shift, sections, email_list } = body;
  const dept = req.fireDepartment.get();
  const { fd_id } = dept;

  // on create, set lastSent to creation time
  const last_sent = moment().format();

  const emailData = {
    fd_id,
    name,
    description,
    schedule,
    enabled,
    by_shift,
    sections,
    email_list,
    last_sent,
  };

  const newEmail = await createCustomEmail(emailData);

  if (newEmail.enabled === true) {
    await CustomEmailScheduler.scheduleCustomEmail(newEmail);
  }
  res.json(newEmail);
}

export async function updateCustomEmail(req, res) {
  const { body } = req;
  const { fd_id, name, description, schedule, enabled, by_shift, sections, email_list } = body;
  const updatedEmail = {
    fd_id,
    name,
    description,
    schedule,
    enabled,
    by_shift,
    sections,
    email_list,
  };
  const { emailId } = req.params;

  await update(emailId, updatedEmail);
  if (updatedEmail.enabled === true) {
    await CustomEmailScheduler.scheduleCustomEmail(updatedEmail);
  } else {
    CustomEmailScheduler.unscheduleEmail(updatedEmail._id);
  }
  res.json(updatedEmail);
}

export async function deleteCustomEmail(req, res) {
  const { emailId } = req.params;

  await destroy(emailId);
  CustomEmailScheduler.unscheduleEmail(emailId);
  res.json({ msg: `email ${emailId} deleted` });
}

export async function preview(req, res) {
  const emailData = req.body;

  emailData.fireDepartment = await getFireDepartment(emailData.fd_id);

  const extensionConfig = await ExtensionConfiguration.find({
    where: { fire_department__id: emailData.fireDepartment._id },
    include: [{
      model: Extension,
      where: { name: 'Email Report' },
    }],
  });

  const options = {
    name: 'options',
    content: { logo: extensionConfig.config_json.logo },
  };

  // get dummy data for each section
  const mergeVars = getPreviewData(emailData, options);

  const desc = {
    name: 'description',
    content: {
      departmentName: 'Test Dept',
      timeRange: 'Dec 27, 2020 8:00 AM - Dec 28, 2020 8:00 AM',
      runTime: 'Dec 28, 2020 8:25 AM',
      title: 'Custom Report - 2020-12-27',
      subtitle: 'some subtitle',
      shift: 'Shift Report - 2020-12-27 Shift A',
    },
  };
  mergeVars.push(desc);
  const html = getEmailHtml(mergeVars);
  res.json({ html });
}
