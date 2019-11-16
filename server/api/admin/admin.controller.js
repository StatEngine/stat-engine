'use strict';

import { FireDepartment } from '../../sqldb';
import { NotFoundError } from '../../util/error';

export async function chargebeeWebhook(req, res) {
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

    // Update the department's subscription status if it changed.
    const subscription = req.body.content.subscription;
    if(subscription && subscription.status !== fireDepartment.subscription_status) {
      console.log(`Fire department "${fireDepartment.name}" subscription status changed to "${subscription.status}"`);

      fireDepartment.subscription_status = subscription.status;
      await fireDepartment.save();
    }
  }

  res.status(200).send('success');
}
