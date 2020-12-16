import moment from 'moment';

import { CustomEmail } from '../../sqldb';
import CustomEmailScheduler from '../../lib/customEmails/customEmailScheduler';

export async function queryFindAll(where) {
  if (where) {
    return CustomEmail.findAll({ where, raw: true });
  }
  return CustomEmail.findAll({ raw: true });
}

export async function queryFindOne(emailId) {
  const where = {
    _id: emailId,
  };
  return CustomEmail.findOne({ where, raw: true });
}

export async function queryUpdate(emailId, updateData) {
  return CustomEmail.update(
    updateData,
    {
      where: {
        _id: emailId,
      },
    },
  );
}

// gets all custom emails for a given fire dept id
// used for the list page of the webapp
export async function listByDeptId(req, res) {
  const fdId = req.user.dataValues.FireDepartment.dataValues.fd_id;
  const where = {
    fd_id: fdId,
  };
  const emails = await queryFindAll(where);
  res.json({ emails });
}

export async function find(req, res) {
  const { emailId } = req.params;
  const email = await queryFindOne(emailId);
  console.log('CUSTOM EMAIL FIND');
  console.dir(email);
  res.json(email);
}

export async function create(req, res) {
  const { body } = req;
  const dept = req.fireDepartment.get();

  // on create, set lastSent to creation time
  const lastSent = moment().format();
  const emailData = { ...body, fd_id: dept.fd_id, last_sent: lastSent };
  const dbRes = await CustomEmail.create(emailData);
  const newEmail = dbRes.dataValues;
  newEmail.dept = dept;
  if (newEmail.enabled) {
    await CustomEmailScheduler.scheduleCustomEmail(newEmail);
  }
  res.json(newEmail);
}

export async function update(req, res) {
  const { body: updatedEmail } = req;
  const { emailId } = req.params;
  await queryUpdate(emailId, updatedEmail);
  if (updatedEmail.enabled) {
    await CustomEmailScheduler.scheduleCustomEmail(updatedEmail);
  } else {
    CustomEmailScheduler.unscheduleEmail(updatedEmail._id);
  }
  res.json(updatedEmail);
}

export async function deleteCustomEmail(req, res) {
  const { emailId } = req.params;
  await CustomEmail.destroy({
    where: {
      _id: emailId,
    },
  });
  CustomEmailScheduler.unscheduleEmail(emailId);

  res.json({
    msg: `email ${emailId} deleted`,
  });
}

