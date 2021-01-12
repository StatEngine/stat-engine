/* eslint-disable import/prefer-default-export */
import getFireDepartment from '../../lib/customEmails/fireDepartment';

export async function emailList(req, res) {
  const fdId = req.user.dataValues.FireDepartment.dataValues.fd_id;
  const fireDept = await getFireDepartment(fdId);
  const deptEmails = fireDept.Users.map(u => u.email);
  res.json({ deptEmails });
}
