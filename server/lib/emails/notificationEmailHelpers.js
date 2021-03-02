import _ from 'lodash';

import { Extension, ExtensionConfiguration, FireDepartment, User } from '../../sqldb';
import { TimeUnit } from '../../components/constants/time-unit';

export async function getReportOptions(emailConfigId, fireDepartmentId) {
  const extensionConfig = await ExtensionConfiguration.find({
    where: {
      fire_department__id: fireDepartmentId,
      _id: emailConfigId,
    },
    include: [{
      model: Extension,
      where: { name: 'Email Report' },
    }],
  });
  const reportOptions = extensionConfig ? extensionConfig.config_json : undefined;
  // Set defaults
  if (_.isUndefined(reportOptions.showPercentChange)) {
    reportOptions.showPercentChange = true;
  } else {
    reportOptions.showPercentChange = false;
  }

  if (_.isUndefined(reportOptions.showUtilization)) {
    reportOptions.showUtilization = true;
  } else {
    reportOptions.showUtilization = false;
  }

  // Override day reports to use shift time.
  if (reportOptions.timeUnit.toLowerCase() === TimeUnit.Day) {
    reportOptions.timeUnit = TimeUnit.Shift;
  }
  return reportOptions;
}

export async function getEmailList(reportOptions, fireDepartmentId) {
  const fd = await FireDepartment.find({
    where: { _id: fireDepartmentId },
    attributes: [
      '_id',
    ],
    include: [{
      model: User,
      attributes: ['_id', 'first_name', 'last_name', 'email', 'role', 'unsubscribed_emails'],
    }],
  });

  const allUsers = fd.Users;

  const subscribedUsers = allUsers.filter(user => user.isSubscribedToEmail(reportOptions.name));

  if (reportOptions.to) {
    reportOptions.to.forEach(u => {
      if (subscribedUsers.findIndex(su => su.email === u.email) === -1) {
        subscribedUsers.push({
          isAdmin: false,
          isExternal: true,
          _id: u.email,
          email: u.email,
          isSubscribedToEmail: () => true,
        });
      }
    });
  }

  return subscribedUsers.map(su => su.email);
}
