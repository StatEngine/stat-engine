import moment from 'moment-timezone';
import AWS from 'aws-sdk';

import { Weather } from '../../lib/weather';

const sageMakerRuntime = new AWS.SageMakerRuntime({
  region: 'us-east-1',
});

export async function getPrediction(req, res) {
  const weather = new Weather();
  const forecast = await weather.getForecast(req.user.FireDepartment.latitude, req.user.FireDepartment.longitude);

  /*
   * TODO...
   * Should we be forecasting on next hour/next day?
   *
   * 1.  change firecares_id and not fire_department_id
   * 2.  remove description.day_of_week and month
   */
  let tomorrowsWeather = forecast.daily.data[0];
  let tomorrowsMoment = moment.tz(req.user.FireDepartment.time_zone).add(1, 'day');

  const modelInput = {
    model_name: 'daily_ems_incidents',
    model_version: '1',
    prediction_data: [{
      'fire_department.firecares_id': req.user.FireDepartment.firecares_id,
      date: tomorrowsMoment.format('YYYY-MM-DD'),
      precip_type: tomorrowsWeather.precipType,
      high_temp: tomorrowsWeather.temperatureHigh,
      precip_intensity: tomorrowsWeather.precipIntensityMax,

      // ideally, we can remove these
      'description.day_of_week': tomorrowsMoment.format('dddd'),
      month: tomorrowsMoment.format('MMMM'),
    }],
  };

  console.dir(modelInput);

  const params = {
    Body: Buffer.from(JSON.stringify(modelInput)),
    ContentType: 'application/json',
    EndpointName: 'sagemaker-scikit-learn-2019-10-24-00-53-01-251',
  };

  const prediction = await sageMakerRuntime.invokeEndpoint(params).promise();
  const parsedResults = JSON.parse(prediction.Body.toString());

  // since were only making 1 prediction, return first index
  res.json({ 'daily_ems_incidents': parsedResults[0] });
}
