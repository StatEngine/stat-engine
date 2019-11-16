import { FireDepartment } from '../../sqldb';
import { NotFoundError } from '../../util/error';

export async function webhook(req, res) {
  const eventType = req.body.event_type;
  console.log(`Received Chargebee event "${eventType}"`);

  const customer = req.body.content.customer;
  if(customer) {
    const fireDepartment = await FireDepartment.find({
      where: {
        customer_id: customer.id,
      },
    });

    if(!fireDepartment) {
      throw new NotFoundError(`Fire department with customer id "${customer.id}" not found.`);
    }

    const subscription = req.body.content.subscription;
    if(subscription) {
      fireDepartment.subscription = subscription;
      await fireDepartment.save();
    }
  }

  res.status(200).send('success');
}
