import { CustomEmail } from '../../sqldb';

export async function list(req, res) {
  const fdId = req.user.dataValues.FireDepartment.dataValues.fd_id;
  const dbRes = await CustomEmail.findAll({
    where: {
      fd_id: fdId,
    },
  });
  res.json({
    emails: dbRes,
  });
}

export async function find(req, res) {
  const { emailId } = req.params;
  const dbRes = await CustomEmail.findAll({
    where: {
      _id: emailId,
    },
  });
  const email = dbRes[0].dataValues;
  res.json(email);
}

export async function create(req, res) {
  const { body } = req;
  const fdId = req.user.dataValues.FireDepartment.dataValues.fd_id;
  const emailData = { ...body, fd_id: fdId };
  const dbRes = await CustomEmail.create(emailData);
  const newEmail = dbRes.dataValues;
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
