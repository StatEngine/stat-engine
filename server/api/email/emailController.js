import { handleCustomEmail, handleNotificationEmail } from '../../lib/emails/buildAndSendEmails';
export async function emailController(req, res) {
  const configId = req.query.configurationId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const previous = req.query.previous;
  const fireDepartment = req.fireDepartment.get();
  const emailResponse = await handleNotificationEmail(configId, startDate, endDate, previous, fireDepartment);

  res.json(emailResponse);
}

export async function customEmailController(req, res) {
  console.dir(req.body);
  console.log('BUILD CONTENT AND SEND');
  const { emailConfigId } = req.body;

  const emailResponse = await handleCustomEmail(emailConfigId);

  res.json(emailResponse);
}
