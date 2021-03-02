import { CustomEmail } from '../../sqldb';

export async function create(emailData) {
  const dbRes = CustomEmail.create(emailData);
  return dbRes.dataValues;
}

export async function destroy(emailId) {
  const where = { _id: emailId };
  return CustomEmail.destroy({ where });
}

export async function findAll(where) {
  if (where) {
    return CustomEmail.findAll({ where, raw: true });
  }
  return CustomEmail.findAll({ raw: true });
}

export async function findOne(emailId) {
  const where = { _id: emailId };
  return CustomEmail.findOne({ where, raw: true });
}

export async function update(emailId, updateData) {
  return CustomEmail.update(
    updateData,
    { where: { _id: emailId } },
  );
}
