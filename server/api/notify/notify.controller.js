import axios from 'axios';

import { InternalServerError } from '../../util/error';

export async function notify(req, res) {
  try {    
    const token = req.NFORS_TOKEN;

    const response = await axios({
      method: 'POST',
      url: process.env.NFORS_API_URL + 'api/notify',
      data: { ...req.body },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 200) {
      return res.send(200);
    } else {
      return res.send(response && response.status || 500);
    }
  } catch(err) {
    throw new InternalServerError(err.message);
  }
}