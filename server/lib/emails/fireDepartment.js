import { FireDepartment, User } from '../../sqldb';

export default async function getFireDepartment(fdId) {
  return FireDepartment.findOne({
    where: { fd_id: fdId },
    include: [{
      model: User,
      attributes: ['_id', 'first_name', 'last_name', 'email', 'role', 'unsubscribed_emails'],
    }],
  });
}
