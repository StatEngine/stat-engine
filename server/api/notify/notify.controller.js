import axios from 'axios';

import { InternalServerError } from '../../util/error';

export async function notify(req, res) {
  try {    
    const token = req.NFORS_TOKEN;

    axios({
      method: 'POST',
      url: process.env.NFORS_API_URL + 'api/notify',
      data: { ...req.body },
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => console.info('Notification successful'))
    .catch(() => console.info('Notification failed'));

    return res.send(204);
  } catch(err) {
    throw new InternalServerError(err.message);
  }
}