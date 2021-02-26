/* eslint-disable no-undef */
import { expect } from 'chai';
import fs from 'fs';

import loadJson from '../../../../server/lib/loadJson';
import handleNotificationEmail from '../../../../server/lib/emails/notificationEmails';

describe('notification email', () => {
  describe('fundamental tests', () => {
    describe.skip('happy path tests', () => {
      it('should create a valid html for all sections', async () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockFireDepartmentFileName = 'fireDepartment.mock.json';
        const mockNotificationEmailHtml = fs.readFileSync(`${mockDataPath}/notificationEmailHtml.mock.html`, 'utf-8');
        const fireDepartment = loadJson(mockDataPath, mockFireDepartmentFileName);
        const emailConfigId = 1;
        const startDate = '2020-12-18';
        const endDate = '2020-12-21';
        const previous = true;

        const html = handleNotificationEmail(emailConfigId, startDate, endDate, previous, fireDepartment);

        expect(html).to.equal(mockNotificationEmailHtml);
      });
    });
  });
});
