import chargebee from 'chargebee';
import _ from 'lodash';

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY});


export const createCustomer = fireDepartment => {
  if(_.isEmpty(process.env.CHARGEBEE_API_KEY)) {
    return;
  }

  return chargebee.customer.create({ company: fireDepartment.name.substring(0, 250) })
    .request()
    .then(response => {
      fireDepartment.customer_id = response.customer.id;
      return fireDepartment.save();
    });
};


export const Chargebee = chargebee;
