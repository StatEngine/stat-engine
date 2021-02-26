import { getReportOptions, getEmailList } from './notificationEmailHelpers';
import { calculateTimeRange } from '../../lib/timeRangeUtils';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';
import { getMergeVars, sendEmails } from './buildAndSendEmails';
import descriptionSection from './sections/description';
import getEmailHtml from '../../api/email/getEmailHtmlController';

export default async function handleNotificationEmail(emailConfigId, startDate, endDate, previous, fireDepartment, test) {
  // TESTING reportOptions is for testing only
  // richmond
  // const reportOptions = {
  //   name: 'Daily',
  //   timeUnit: 'SHIFT',
  //   sections: {
  //     showAlertSummary: { FireIncidentEventDurationRule30: false },
  //     showBattalionSummary: true,
  //     showIncidentTypeSummary: false,
  //     showAgencyIncidentTypeSummary: false,
  //     showUnitAgencySummary: true,
  //   },
  //   showDistances: false,
  //   showTransports: true,
  //   showPercentChange: true,
  //   showUtilization: true,
  //   logo: 'https://s3.amazonaws.com/statengine-public-assets/logos/93345.png',
  //   to: [
  //     { email: 'mailinglist@test.com' },
  //   ],
  //   schedulerOptions: { later: { text: 'every 2 minutes' } },
  // };

  // rincon
  // const reportOptions = {
  //   name: 'Daily',
  //   timeUnit: 'SHIFT',
  //   sections: {
  //     showAlertSummary: true,
  //     showBattalionSummary: false,
  //     showIncidentTypeSummary: true,
  //     showAgencyIncidentTypeSummary: false,
  //     showUnitAgencySummary: true,
  //     showJurisdictionSummary: false,
  //   },
  //   emailAllUsers: true,
  //   showDistances: false,
  //   showTransports: true,
  //   showPercentChange: true,
  //   showUtilization: true,
  //   logo: 'https://s3.amazonaws.com/statengine-public-assets/logos/93429.png',
  //   schedulerOptions: { later: { text: 'every 2 minutes' } },
  // };

  // roseville
  // const reportOptions = {
  //   name: 'Daily',
  //   timeUnit: 'SHIFT',
  //   sections: {
  //     showAlertSummary: { FireIncidentEventDurationRule30: false },
  //     showIncidentTypeSummary: true,
  //     showAgencyIncidentTypeSummary: false,
  //     showUnitAgencySummary: true,
  //     showBattalionSummary: false,
  //     showJurisdictionSummary: true,
  //   },
  //   showPercentChange: false,
  //   showDistances: false,
  //   showTransports: false,
  //   showUtilization: true,
  //   previous: false,
  //   logo: 'https://s3.amazonaws.com/statengine-public-assets/logos/77855.png',
  //   schedulerOptions: { later: { text: 'at 1:05 pm' } },
  // };

  // rincon valley
  // fireDepartment = {
  //   es_indices: {
  //     all: '93429-az-rincon_valley_fire_district*',
  //     'fire-incident': '93429-az-rincon_valley_fire_district-fire-incident*',
  //     'apparatus-fire-incident': '93429-az-rincon_valley_fire_district-apparatus-fire-incident*',
  //     'vehicle-telemetry': '93429-az-rincon_valley_fire_district-vehicle-telemetry*',
  //   },
  //   _id: 72,
  //   fd_id: '11152',
  //   name: 'Rincon Valley Fire District',
  //   state: 'AZ',
  //   firecares_id: '93429',
  //   timezone: 'US/Arizona',
  //   integration_complete: true,
  //   integration_verified: true,
  //   latitude: 32.0862,
  //   longitude: -110.712,
  //   logo_link: 'https://s3.amazonaws.com/statengine-public-assets/logos/93429.png',
  //   customer_id: 'AzZcotRumF5B9Ajl',
  // };

  // roseville
  // fireDepartment = {
  //   es_indices: {
  //     all: '77855-ca-city_of_roseville_fire_department*',
  //     'fire-incident': '77855-ca-city_of_roseville_fire_department-fire-incident*',
  //     'apparatus-fire-incident': '77855-ca-city_of_roseville_fire_department-apparatus-fire-incident*',
  //   },
  //   _id: 72,
  //   fd_id: '11152',
  //   name: 'City of Roseville Fire Department',
  //   state: 'CA',
  //   firecares_id: '77855',
  //   timezone: 'US/Pacific',
  //   integration_complete: true,
  //   integration_verified: true,
  //   latitude: 32.0862,
  //   longitude: -110.712,
  //   logo_link: 'https://s3.amazonaws.com/statengine-public-assets/logos/77855.png',
  //   customer_id: 'AzZcotRumF5B9Ajl',
  // };


  const reportOptions = await getReportOptions(emailConfigId, fireDepartment._id);

  const timeRange = calculateTimeRange({
    startDate,
    endDate,
    timeUnit: reportOptions.timeUnit,
    firecaresId: fireDepartment.firecares_id,
    previous,
  });

  const analysis = new IncidentAnalysisTimeRange({
    index: fireDepartment.es_indices['fire-incident'],
    timeRange,
  });

  const comparison = await analysis.compare();
  const ruleAnalysis = await analysis.ruleAnalysis();

  const sections = getNotificationEmailSections();

  const params = {
    comparison,
    fireDepartment,
    reportOptions,
    ruleAnalysis,
    sections,
    timeRange,
  };

  const sectionData = await getMergeVars(params);

  const description = descriptionSection(fireDepartment, timeRange, analysis.previousTimeFilter, reportOptions);

  const mergeVars = {
    description,
    options: reportOptions,
    sections: sectionData,
  };

  // TESTING
  // const emailList = ['paul@prominentedge.com'];
  const emailList = await getEmailList(reportOptions, fireDepartment._id);
  const html = await getEmailHtml(mergeVars);

  await Promise.all(sendEmails(emailList, mergeVars, html, test));

  return mergeVars;
}

function getNotificationEmailSections() {
  return [
    { type: 'agencyIncidentTypeSummary' },
    { type: 'agencySummary' },
    { type: 'alertSummary' },
    { type: 'battalionSummary' },
    { type: 'incidentSummary' },
    { type: 'incidentTypeSummary' },
    { type: 'jurisdictionSummary' },
    { type: 'unitSummary' },
  ];
}
