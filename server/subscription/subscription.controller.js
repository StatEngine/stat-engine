'use strict';
import { Chargebee } from './chargebee';


export function subscriptionPortal(req, res) {
  return Chargebee.portal_session.create({
    redirect_url: 'https://statengine.io/home',
    customer: {id: req.user.FireDepartment.customer_id}}
  ).request()
    .then(r => res.redirect(r.portal_session.access_url));
}
