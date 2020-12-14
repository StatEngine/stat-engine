import { CustomEmail } from '../../sqldb';
import CustomEmailScheduler from '../../lib/customEmails/customEmailScheduler';

export async function queryFindAll(where) {
  if (where) {
    return CustomEmail.findAll({ where, raw: true });
  }
  return CustomEmail.findAll({ raw: true });
}

// gets all custom emails for a given fire dept id
// used for the list page of the webapp
export async function listByDeptId(req, res) {
  const fdId = req.user.dataValues.FireDepartment.dataValues.fd_id;
  console.log('LIST BY DEPT ID');
  console.log(fdId);
  const where = {
    fd_id: fdId,
  };
  const emails = await queryFindAll(where);
  res.json({ emails });
}

export async function find(req, res) {
  const { emailId } = req.params;
  const where = {
    _id: emailId,
  };
  const email = await CustomEmail.findOne({ where, raw: true });
  console.log('CUSTOM EMAIL FIND');
  console.dir(email);

  res.json(email);
}

export async function create(req, res) {
  const { body } = req;
  console.log('CREATE EMAIL');
  const fdId = req.user.dataValues.FireDepartment.dataValues.fd_id;
  const emailData = { ...body, fd_id: fdId };
  console.dir(emailData);

  const dbRes = await CustomEmail.create(emailData);
  const newEmail = dbRes.dataValues;
  if (newEmail.enabled) {
    await CustomEmailScheduler.scheduleCustomEmail(newEmail);
  }
  res.json(newEmail);
}

export async function update(req, res) {
  const { body } = req;
  const { emailId } = req.params;
  const dbRes = await CustomEmail.update(
    body,
    {
      where: {
        _id: emailId,
      },
    },
  );
  const updatedEmail = dbRes[0].dataValues;
  if (updatedEmail.enabled) {
    await CustomEmailScheduler.scheduleCustomEmail(updatedEmail);
  } else {
    CustomEmailScheduler.removeEmailSchedule(updatedEmail);
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
  res.json({
    msg: `email ${emailId} deleted`,
  });
}

