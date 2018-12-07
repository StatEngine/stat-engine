import chargebee from 'chargebee';
import _ from 'lodash';

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY});


export const createCustomer = async fireDepartment => {
  let skip = _.isEmpty(process.env.CHARGEBEE_API_KEY) || _.isEmpty(fireDepartment);

  //if customer id check
  if(!skip && !_.isEmpty(fireDepartment.customer_id)) {
    const customer = await chargebee.customer
      .retrieve(fireDepartment.customer_id)
      .request()
      .catch(console.log);

    if(customer) {
      // this customer already exists in chargebee.
      skip = true;
    }
  }

  if(skip) {
    // one of the check's failed skip
    return;
  }

  let customerResponse = await chargebee.customer
    .create({ company: fireDepartment.name.substring(0, 250) }).request();
  fireDepartment.customer_id = customerResponse.customer.id;
  fireDepartment.save();
};


export const Chargebee = chargebee;
