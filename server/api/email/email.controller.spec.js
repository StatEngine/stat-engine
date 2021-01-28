// import AWSMock from 'aws-sdk-mock';
import connection from '../../elasticsearch/connection';
import { ExtensionConfiguration } from '../../sqldb';
import { TimeUnit } from '../../components/constants/time-unit';
import { sendTimeRangeAnalysis } from './email.controller';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';


function mockExtensionConfiguration() {
  ExtensionConfiguration.find = function() {
    return {
      config_json: { timeUnit: TimeUnit.Day },
    };
  };
}

function mockIncidentAnalysisTimeRange() {
  IncidentAnalysisTimeRange.prototype.compare = () => {};
}

function mockElasticSearch() {
  connection.getClient = () => {
    return {
      msearch: () => {
        console.log('Hello from elasticsearch mock');
        return Promise.resolve({});
      },
    };
  };
}

describe('email.controller', () => {
  describe('sendTimeRangeAnalysis()', () => {
    beforeEach(() => {
      mockExtensionConfiguration();
      mockIncidentAnalysisTimeRange();
      mockElasticSearch();
    });
    after(() => {
      // AWSMock.restore('S3');
    });
    it('should execute with no errors', async () => {
      const req = {
        query: {
          configurationId: 'test-configurationId',
        },
        fireDepartment: {
          get() {
            return {
              es_indices: {
                'fire-incident': 'test-fire-incident',
              },
            };
          },
        },
      };
      const res = {};
      await sendTimeRangeAnalysis(req, res);
    });
  });
});
