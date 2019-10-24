import { Weather } from '../../lib/weather';

export async function getForecast(req, res) {
  const weather = new Weather();
  const forecast = await weather.getForecast(req.user.FireDepartment.latitude, req.user.FireDepartment.longitude);

  res.json(forecast);
}

export default getForecast;
