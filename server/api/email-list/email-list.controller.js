/* eslint-disable import/prefer-default-export */
import getFireDepartment from '../../lib/customEmails/fireDepartment';

export async function emailList(req, res) {
  console.log('EMAIL LIST');
  const fdId = req.user.dataValues.FireDepartment.dataValues.fd_id;
  const fireDept = await getFireDepartment(fdId);
  const deptEmails = fireDept.Users.map(u => u.email);
  console.dir(deptEmails);
  res.json({ deptEmails });
}
