import request from 'request-promise';
import moment from 'moment';

export function getForecast(req, res) {
  const now = moment.tz(req.user.FireDepartment.timezone);
  let requestedTime = now;
  let today;
  if(req.query.date) {
    requestedTime = moment(req.query.date).tz(req.user.FireDepartment.timezone);
    today = requestedTime.format('YYYY-MM-DD').toString() === req.query.date.toString();
  }

  // Dont include time if requested date is today
  // DarkSky doesnt return alerts on time machine requests, but we want these to show up
  let uri = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_TOKEN}/${req.user.FireDepartment.latitude},${req.user.FireDepartment.longitude}`;
  if(today) uri += `,${requestedTime.unix()}`;

  console.dir(uri);

  return request({
    uri,
    qs: {
      exclude: 'minutely'
    },
    json: true
  })
    .then(results => res.json(results))
    .catch(() => res.status(500).send());
}

export default getForecast;
