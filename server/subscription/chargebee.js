import chargebee from 'chargebee';
import 'babel-polyfill';

import _ from 'lodash';
import { Log } from '../util/log';

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY});

export const createCustomer = async fireDepartment => {
  Log.info('Creating customer');
  let skip = _.isEmpty(process.env.CHARGEBEE_API_KEY) || _.isEmpty(fireDepartment);

  //if customer id check
  if(!skip && !_.isEmpty(fireDepartment.customer_id)) {
    const customer = await chargebee.customer
      .retrieve(fireDepartment.customer_id)
      .request()
      .catch(Log.error);

    if(customer) {
      // this customer already exists in chargebee.
      skip = true;
    }
  }

  if(skip) {
    // one of the check's failed skip
    return Promise.resolve();
  }

  let customerResponse = await chargebee.customer
    .create({ company: fireDepartment.name.substring(0, 250) }).request();
  fireDepartment.customer_id = customerResponse.customer.id;
  return fireDepartment.save();
};

export const retrieveSubscription = async fireDepartment => {
  if (_.isEmpty(fireDepartment.customer_id)) {
    return null;
  }

  // Return the last created subscription, or null if none exist.
  const subscriptions = await chargebee.subscription
    .list({
      'customer_id[is]': fireDepartment.customer_id,
      'sort_by[desc]': 'created_at',
    })
    .request()
    .catch(Log.error);

  return (subscriptions.list.length) ? subscriptions.list[0].subscription : null;
};

export const Chargebee = chargebee;
