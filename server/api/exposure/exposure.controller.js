import axios from 'axios';

export async function exposure(req, res) {
  try {    
    const department = req.fireDepartment;
    const id = department.firecares_id;
    const response = await axios({
      method: 'GET',
      url: `${process.env.NFORS_API_URL}api/departments/${id}/iac`,
      headers: { 'Authorization': `Bearer ${req.NFORS_TOKEN}` }
    });

    if (response.status === 200) {
      return res.send({
          iac: response.data.iac
      });
    } else {
      return res.send(response.status);
    }
  } catch({ response }) {
    res.send(response && response.status || 500);
  }
}