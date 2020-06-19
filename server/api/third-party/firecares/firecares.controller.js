import axios from 'axios';

export async function getDepartment(req, res) {
  const firecares_id = req.params.firecares_id;
  if (firecares_id) {
    try {
      const url = `https://firecares.org/api/v1/firestations/${firecares_id}`;
      const response = await axios.get(url);
      return res.json(response.data);
    } catch (err) {
      return res.send(500);
    }
  } else {
    return res.send(404);
  }
}
