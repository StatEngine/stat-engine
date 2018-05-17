import request from 'request-promise';
import moment from 'moment';

export function getForecast(req, res) {
  const now = moment.tz(req.user.FireDepartment.timezone);
  const requestedTime = moment(req.query.date).tz(req.user.FireDepartment.timezone) || now;

  const today = now.diff(requestedTime, 'hours') < 24;

  // Dont include time if requested date is today
  // DarkSky doesnt return alerts on time machine requests, but we want these to show up
  let uri = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_TOKEN}/${req.user.FireDepartment.latitude},${req.user.FireDepartment.longitude}`;
  if(!today) uri += `,${requestedTime.unix()}`;

  return request({
    uri,
    qs: {
      exclude: 'minutely'
    },
    json: true
  }).then(results => res.json(results));
}

export default getForecast;
