import {
  sendEmail
} from './mandrill';
import 'chai/register-should';


let mergeVars = [{
    name: 'description',
    content: {
      departmentName: 'Richmond Fire and Emergency Services',
      timeRange: 'Aug 5, 2018 8:00 AM - Aug 6, 2018 8:00 AM',
      runTime: 'Aug 6, 2018 11:44 PM',
      logo: 'https://s3.amazonaws.com/statengine-public-assets/richmond.png',
      shift: 'B'
    }
  },
  {
    name: 'options',
    content: {
      sections: {
        showAlertSummary: false,
        showBattalionSummary: true,
        showIncidentTypeSummary: false,
      },
      showDistances: true,
      showTransports: false,
    }
  }, {
    name: 'battalionMetrics',
    content: [{
        battalionId: 'BC1',
        incidentCount: {
          val: 26,
          previousVal: 28,
          percentChange: -7
        }
      },
      {
        battalionId: 'BC2',
        incidentCount: {
          val: 17,
          previousVal: 27,
          percentChange: -37
        }
      },
      {
        battalionId: 'BC3',
        incidentCount: {
          val: 30,
          previousVal: 23,
          percentChange: 30
        }
      },
      {
        battalionId: 'BC4',
        incidentCount: {
          val: 14,
          previousVal: 27,
          percentChange: -48
        }
      }
    ]
  }, {
    name: 'fireDepartmentMetrics',
    content: [{
        label: 'Total Incidents',
        val: 87,
        previousVal: 105,
        percentChange: -17
      },
      {
        label: 'EMS Incidents',
        val: 55,
        previousVal: 71,
        percentChange: -23
      },
      {
        label: 'Fire Incidents',
        val: 32,
        previousVal: 34,
        percentChange: -6
      },
      {
        label: 'Total Responses',
        val: 130,
        previousVal: 149,
        percentChange: -13
      },
      {
        label: 'Six Minute Response Percentage',
        val: 86,
        previousVal: 84,
        percentChange: 3
      },
      {
        label: '90% Distance to Incident (mi)',
        val: 3,
        previousVal: 3,
        percentChange: 15
      },
      {
        label: '90% Turnout Duration (sec)',
        val: 91,
        previousVal: 97,
        percentChange: -6
      },
      {
        label: '90% Event Duration (min)',
        val: 29,
        previousVal: 32,
        percentChange: -10
      }
    ]
  },
  {
    name: 'unitMetrics',
    content: [{
        unitId: 'E11',
        incidentCount: {
          val: 12,
          previousVal: 6,
          percentChange: 100
        },
        distanceToIncidentSum: {
          val: 9,
          previousVal: 3,
          percentChange: 174
        },
        eventDurationSum: {
          val: 65,
          previousVal: 80,
          percentChange: -18
        },
        turnoutDurationPercentile90: {
          val: 8019,
          previousVal: 5188,
          percentChange: 55
        },
        responseDurationPercentile90: {
          val: 302,
          previousVal: 264,
          percentChange: 15
        }
      },
      {
        unitId: 'E5',
        incidentCount: {
          val: 12,
          previousVal: 10,
          percentChange: 20
        },
        distanceToIncidentSum: {
          val: 11,
          previousVal: 11,
          percentChange: -5
        },
        eventDurationSum: {
          val: 85,
          previousVal: 99,
          percentChange: -14
        },
        turnoutDurationPercentile90: {
          val: 11957,
          previousVal: 10780,
          percentChange: 11
        },
        responseDurationPercentile90: {
          val: 289,
          previousVal: 322,
          percentChange: -10
        }
      },
      {
        unitId: 'E6',
        incidentCount: {
          val: 10,
          previousVal: 5,
          percentChange: 100
        },
        distanceToIncidentSum: {
          val: 8,
          previousVal: 6,
          percentChange: 49
        },
        eventDurationSum: {
          val: 72,
          previousVal: 84,
          percentChange: -14
        },
        turnoutDurationPercentile90: {
          val: 9550,
          previousVal: 2874,
          percentChange: 232
        },
        responseDurationPercentile90: {
          val: 396,
          previousVal: 316,
          percentChange: 25
        }
      },
      {
        unitId: 'E18',
        incidentCount: {
          val: 8,
          previousVal: 4,
          percentChange: 100
        },
        distanceToIncidentSum: {
          val: 7,
          previousVal: 3,
          percentChange: 106
        },
        eventDurationSum: {
          val: 87,
          previousVal: 112,
          percentChange: -22
        },
        turnoutDurationPercentile90: {
          val: 5671,
          previousVal: 1916,
          percentChange: 196
        },
        responseDurationPercentile90: {
          val: 344,
          previousVal: 281,
          percentChange: 22
        }
      },
      {
        unitId: 'E15',
        incidentCount: {
          val: 7,
          previousVal: 8,
          percentChange: -12
        },
        distanceToIncidentSum: {
          val: 6,
          previousVal: 10,
          percentChange: -37
        },
        eventDurationSum: {
          val: 69,
          previousVal: 79,
          percentChange: -13
        },
        turnoutDurationPercentile90: {
          val: 4441,
          previousVal: 6375,
          percentChange: -30
        },
        responseDurationPercentile90: {
          val: 368,
          previousVal: 545,
          percentChange: -32
        }
      },
      {
        unitId: 'E10',
        incidentCount: {
          val: 6,
          previousVal: 5,
          percentChange: 20
        },
        distanceToIncidentSum: {
          val: 9,
          previousVal: 4,
          percentChange: 109
        },
        eventDurationSum: {
          val: 85,
          previousVal: 104,
          percentChange: -19
        },
        turnoutDurationPercentile90: {
          val: 4528,
          previousVal: 2312,
          percentChange: 96
        },
        responseDurationPercentile90: {
          val: 412,
          previousVal: 275,
          percentChange: 49
        }
      },
      {
        unitId: 'E14',
        incidentCount: {
          val: 6,
          previousVal: 9,
          percentChange: -33
        },
        distanceToIncidentSum: {
          val: 4,
          previousVal: 8,
          percentChange: -44
        },
        eventDurationSum: {
          val: 102,
          previousVal: 68,
          percentChange: 50
        },
        turnoutDurationPercentile90: {
          val: 3180,
          previousVal: 9072,
          percentChange: -65
        },
        responseDurationPercentile90: {
          val: 270,
          previousVal: 776,
          percentChange: -65
        }
      },
      {
        unitId: 'E22',
        incidentCount: {
          val: 6,
          previousVal: 11,
          percentChange: -45
        },
        distanceToIncidentSum: {
          val: 8,
          previousVal: 12,
          percentChange: -35
        },
        eventDurationSum: {
          val: 87,
          previousVal: 69,
          percentChange: 25
        },
        turnoutDurationPercentile90: {
          val: 7009,
          previousVal: 14249,
          percentChange: -51
        },
        responseDurationPercentile90: {
          val: 555,
          previousVal: 344,
          percentChange: 61
        }
      },
      {
        unitId: 'SAFETY2',
        incidentCount: {
          val: 6,
          previousVal: 3,
          percentChange: 100
        },
        distanceToIncidentSum: {
          val: 22,
          previousVal: 12,
          percentChange: 83
        },
        eventDurationSum: {
          val: 354,
          previousVal: 116,
          percentChange: 206
        },
        turnoutDurationPercentile90: {
          val: 5306,
          previousVal: 5630,
          percentChange: -6
        },
        responseDurationPercentile90: {
          val: 800,
          previousVal: 856,
          percentChange: -6
        }
      },
      {
        unitId: 'T10',
        incidentCount: {
          val: 6,
          previousVal: 2,
          percentChange: 200
        },
        distanceToIncidentSum: {
          val: 15,
          previousVal: 6,
          percentChange: 138
        },
        eventDurationSum: {
          val: 123,
          previousVal: 72,
          percentChange: 70
        },
        turnoutDurationPercentile90: {
          val: 8628,
          previousVal: 740,
          percentChange: 1066
        },
        responseDurationPercentile90: {
          val: 798,
          previousVal: 312,
          percentChange: 156
        }
      },
      {
        unitId: 'E1',
        incidentCount: {
          val: 5,
          previousVal: 9,
          percentChange: -44
        },
        distanceToIncidentSum: {
          val: 4,
          previousVal: 7,
          percentChange: -38
        },
        eventDurationSum: {
          val: 90,
          previousVal: 94,
          percentChange: -4
        },
        turnoutDurationPercentile90: {
          val: 3955,
          previousVal: 6972,
          percentChange: -43
        },
        responseDurationPercentile90: {
          val: 273,
          previousVal: 337,
          percentChange: -19
        }
      },
      {
        unitId: 'T1',
        incidentCount: {
          val: 5,
          previousVal: 9,
          percentChange: -44
        },
        distanceToIncidentSum: {
          val: 8,
          previousVal: 15,
          percentChange: -44
        },
        eventDurationSum: {
          val: 83,
          previousVal: 95,
          percentChange: -13
        },
        turnoutDurationPercentile90: {
          val: 3310,
          previousVal: 10875,
          percentChange: -70
        },
        responseDurationPercentile90: {
          val: 296,
          previousVal: 698,
          percentChange: -58
        }
      },
      {
        unitId: 'E23',
        incidentCount: {
          val: 4,
          previousVal: 8,
          percentChange: -50
        },
        distanceToIncidentSum: {
          val: 6,
          previousVal: 8,
          percentChange: -21
        },
        eventDurationSum: {
          val: 73,
          previousVal: 78,
          percentChange: -6
        },
        turnoutDurationPercentile90: {
          val: 3543,
          previousVal: 5596,
          percentChange: -37
        },
        responseDurationPercentile90: {
          val: 372,
          previousVal: 410,
          percentChange: -9
        }
      },
      {
        unitId: 'BC2',
        incidentCount: {
          val: 3,
          previousVal: 1,
          percentChange: 200
        },
        distanceToIncidentSum: {
          val: 8,
          previousVal: 4,
          percentChange: 126
        },
        eventDurationSum: {
          val: 63,
          previousVal: 84,
          percentChange: -25
        },
        turnoutDurationPercentile90: {
          val: 3299,
          previousVal: 355,
          percentChange: 829
        },
        responseDurationPercentile90: {
          val: 418,
          previousVal: 'NaN',
          percentChange: NaN
        }
      },
      {
        unitId: 'E12',
        incidentCount: {
          val: 3,
          previousVal: 7,
          percentChange: -57
        },
        distanceToIncidentSum: {
          val: 4,
          previousVal: 6,
          percentChange: -43
        },
        eventDurationSum: {
          val: 100,
          previousVal: 120,
          percentChange: -16
        },
        turnoutDurationPercentile90: {
          val: 4010,
          previousVal: 3281,
          percentChange: 22
        },
        responseDurationPercentile90: {
          val: 380,
          previousVal: 343,
          percentChange: 11
        }
      },
      {
        unitId: 'E13',
        incidentCount: {
          val: 3,
          previousVal: 5,
          percentChange: -40
        },
        distanceToIncidentSum: {
          val: 3,
          previousVal: 6,
          percentChange: -49
        },
        eventDurationSum: {
          val: 95,
          previousVal: 80,
          percentChange: 19
        },
        turnoutDurationPercentile90: {
          val: 2049,
          previousVal: 3798,
          percentChange: -46
        },
        responseDurationPercentile90: {
          val: 329,
          previousVal: 376,
          percentChange: -13
        }
      },
      {
        unitId: 'E17',
        incidentCount: {
          val: 3,
          previousVal: 6,
          percentChange: -50
        },
        distanceToIncidentSum: {
          val: 5,
          previousVal: 5,
          percentChange: -2
        },
        eventDurationSum: {
          val: 93,
          previousVal: 76,
          percentChange: 23
        },
        turnoutDurationPercentile90: {
          val: 2133,
          previousVal: 9900,
          percentChange: -78
        },
        responseDurationPercentile90: {
          val: 526,
          previousVal: 444,
          percentChange: 18
        }
      },
      {
        unitId: 'E19',
        incidentCount: {
          val: 3,
          previousVal: 3,
          percentChange: 0
        },
        distanceToIncidentSum: {
          val: 5,
          previousVal: 3,
          percentChange: 74
        },
        eventDurationSum: {
          val: 75,
          previousVal: 84,
          percentChange: -11
        },
        turnoutDurationPercentile90: {
          val: 3447,
          previousVal: 3133,
          percentChange: 10
        },
        responseDurationPercentile90: {
          val: 486,
          previousVal: 266,
          percentChange: 83
        }
      },
      {
        unitId: 'E21',
        incidentCount: {
          val: 3,
          previousVal: 2,
          percentChange: 50
        },
        distanceToIncidentSum: {
          val: 4,
          previousVal: 4,
          percentChange: 0
        },
        eventDurationSum: {
          val: 66,
          previousVal: 113,
          percentChange: -42
        },
        turnoutDurationPercentile90: {
          val: 5800,
          previousVal: 2124,
          percentChange: 173
        },
        responseDurationPercentile90: {
          val: 412,
          previousVal: 383,
          percentChange: 8
        }
      },
      {
        unitId: 'BC1',
        incidentCount: {
          val: 2,
          previousVal: 3,
          percentChange: -33
        },
        distanceToIncidentSum: {
          val: 6,
          previousVal: 5,
          percentChange: 6
        },
        eventDurationSum: {
          val: 140,
          previousVal: 98,
          percentChange: 43
        },
        turnoutDurationPercentile90: {
          val: 1359,
          previousVal: 2400,
          percentChange: -43
        },
        responseDurationPercentile90: {
          val: 306,
          previousVal: 446,
          percentChange: -31
        }
      },
      {
        unitId: 'BC3',
        incidentCount: {
          val: 2,
          previousVal: 2,
          percentChange: 0
        },
        distanceToIncidentSum: {
          val: 8,
          previousVal: 4,
          percentChange: 90
        },
        eventDurationSum: {
          val: 59,
          previousVal: 109,
          percentChange: -46
        },
        turnoutDurationPercentile90: {
          val: 3605,
          previousVal: 6031,
          percentChange: -40
        },
        responseDurationPercentile90: {
          val: 624,
          previousVal: 430,
          percentChange: 45
        }
      },
      {
        unitId: 'E20',
        incidentCount: {
          val: 2,
          previousVal: 4,
          percentChange: -50
        },
        distanceToIncidentSum: {
          val: 7,
          previousVal: 4,
          percentChange: 63
        },
        eventDurationSum: {
          val: 37,
          previousVal: 72,
          percentChange: -49
        },
        turnoutDurationPercentile90: {
          val: 2507,
          previousVal: 7137,
          percentChange: -65
        },
        responseDurationPercentile90: {
          val: 532,
          previousVal: 379,
          percentChange: 40
        }
      },
      {
        unitId: 'E25',
        incidentCount: {
          val: 2,
          previousVal: 1,
          percentChange: 100
        },
        distanceToIncidentSum: {
          val: 2,
          previousVal: 2,
          percentChange: -14
        },
        eventDurationSum: {
          val: 87,
          previousVal: 92,
          percentChange: -6
        },
        turnoutDurationPercentile90: {
          val: 2814,
          previousVal: 1167,
          percentChange: 141
        },
        responseDurationPercentile90: {
          val: 406,
          previousVal: 286,
          percentChange: 42
        }
      },
      {
        unitId: 'E8',
        incidentCount: {
          val: 2,
          previousVal: 4,
          percentChange: -50
        },
        distanceToIncidentSum: {
          val: 1,
          previousVal: 4,
          percentChange: -66
        },
        eventDurationSum: {
          val: 60,
          previousVal: 68,
          percentChange: -12
        },
        turnoutDurationPercentile90: {
          val: 1656,
          previousVal: 2178,
          percentChange: -24
        },
        responseDurationPercentile90: {
          val: 246,
          previousVal: 429,
          percentChange: -43
        }
      },
      {
        unitId: 'T13',
        incidentCount: {
          val: 2,
          previousVal: 3,
          percentChange: -33
        },
        distanceToIncidentSum: {
          val: 2,
          previousVal: 9,
          percentChange: -78
        },
        eventDurationSum: {
          val: 79,
          previousVal: 94,
          percentChange: -16
        },
        turnoutDurationPercentile90: {
          val: 3126,
          previousVal: 742,
          percentChange: 321
        },
        responseDurationPercentile90: {
          val: 336,
          previousVal: 'NaN',
          percentChange: NaN
        }
      },
      {
        unitId: 'T22',
        incidentCount: {
          val: 2,
          previousVal: 2,
          percentChange: 0
        },
        distanceToIncidentSum: {
          val: 1,
          previousVal: 1,
          percentChange: -8
        },
        eventDurationSum: {
          val: 105,
          previousVal: 66,
          percentChange: 60
        },
        turnoutDurationPercentile90: {
          val: 1297,
          previousVal: 2827,
          percentChange: -54
        },
        responseDurationPercentile90: {
          val: 335,
          previousVal: 231,
          percentChange: 45
        }
      },
      {
        unitId: 'E16',
        incidentCount: {
          val: 1,
          previousVal: 6,
          percentChange: -83
        },
        distanceToIncidentSum: {
          val: 0,
          previousVal: 7,
          percentChange: -97
        },
        eventDurationSum: {
          val: 174,
          previousVal: 67,
          percentChange: 162
        },
        turnoutDurationPercentile90: {
          val: 1134,
          previousVal: 4717,
          percentChange: -76
        },
        responseDurationPercentile90: {
          val: 208,
          previousVal: 328,
          percentChange: -37
        }
      },
      {
        unitId: 'R23',
        incidentCount: {
          val: 1,
          previousVal: undefined,
          percentChange: undefined
        },
        distanceToIncidentSum: {
          val: 2,
          previousVal: undefined,
          percentChange: undefined
        },
        eventDurationSum: {
          val: 87,
          previousVal: undefined,
          percentChange: undefined
        },
        turnoutDurationPercentile90: {
          val: 906,
          previousVal: undefined,
          percentChange: undefined
        },
        responseDurationPercentile90: {
          val: 392,
          previousVal: undefined,
          percentChange: undefined
        }
      },
      {
        unitId: 'WR1',
        incidentCount: {
          val: 1,
          previousVal: 2,
          percentChange: -50
        },
        distanceToIncidentSum: {
          val: 0,
          previousVal: 2,
          percentChange: -100
        },
        eventDurationSum: {
          val: 8,
          previousVal: 72,
          percentChange: -89
        },
        turnoutDurationPercentile90: {
          val: 1559,
          previousVal: 1175,
          percentChange: 33
        },
        responseDurationPercentile90: {
          val: 285,
          previousVal: 1658,
          percentChange: -83
        }
      },
      {
        unitId: 'WR2',
        incidentCount: {
          val: 1,
          previousVal: 1,
          percentChange: 0
        },
        distanceToIncidentSum: {
          val: 0,
          previousVal: 2,
          percentChange: -100
        },
        eventDurationSum: {
          val: 6,
          previousVal: 62,
          percentChange: -90
        },
        turnoutDurationPercentile90: {
          val: 1450,
          previousVal: 9859,
          percentChange: -85
        },
        responseDurationPercentile90: {
          val: 408,
          previousVal: 612,
          percentChange: -33
        }
      },
      {
        unitId: 'WR24',
        incidentCount: {
          val: 1,
          previousVal: 1,
          percentChange: 0
        },
        distanceToIncidentSum: {
          val: 0,
          previousVal: 4,
          percentChange: -100
        },
        eventDurationSum: {
          val: 1,
          previousVal: 99,
          percentChange: -99
        },
        turnoutDurationPercentile90: {
          val: 612,
          previousVal: 5772,
          percentChange: -89
        },
        responseDurationPercentile90: {
          val: 271,
          previousVal: 1784,
          percentChange: -85
        }
      },
      {
        unitId: 'T24',
        incidentCount: {
          val: 0,
          previousVal: 4,
          percentChange: -100
        },
        distanceToIncidentSum: {
          val: 0,
          previousVal: 6,
          percentChange: -100
        },
        eventDurationSum: {
          val: 0,
          previousVal: 70,
          percentChange: -100
        },
        turnoutDurationPercentile90: {
          val: 0,
          previousVal: 2936,
          percentChange: -100
        },
        responseDurationPercentile90: {
          val: 0,
          previousVal: 340,
          percentChange: -100
        }
      },
      {
        unitId: 'BC4',
        incidentCount: {
          val: 0,
          previousVal: 1,
          percentChange: -100
        },
        distanceToIncidentSum: {
          val: 0,
          previousVal: 3,
          percentChange: -100
        },
        eventDurationSum: {
          val: 0,
          previousVal: 93,
          percentChange: -100
        },
        turnoutDurationPercentile90: {
          val: 0,
          previousVal: 1768,
          percentChange: -100
        },
        responseDurationPercentile90: {
          val: 0,
          previousVal: 465,
          percentChange: -100
        }
      },
      {
        unitId: 'BISLE2',
        incidentCount: {
          val: 0,
          previousVal: 1,
          percentChange: -100
        },
        distanceToIncidentSum: {
          val: 0,
          previousVal: 0,
          percentChange: NaN
        },
        eventDurationSum: {
          val: 0,
          previousVal: 'NaN',
          percentChange: NaN
        },
        turnoutDurationPercentile90: {
          val: 0,
          previousVal: 0,
          percentChange: NaN
        },
        responseDurationPercentile90: {
          val: 0,
          previousVal: 'NaN',
          percentChange: NaN
        }
      },
      {
        unitId: 'BR20',
        incidentCount: {
          val: 0,
          previousVal: 1,
          percentChange: -100
        },
        distanceToIncidentSum: {
          val: 0,
          previousVal: 0,
          percentChange: NaN
        },
        eventDurationSum: {
          val: 0,
          previousVal: 16,
          percentChange: -100
        },
        turnoutDurationPercentile90: {
          val: 0,
          previousVal: 4373,
          percentChange: -100
        },
        responseDurationPercentile90: {
          val: 0,
          previousVal: 212,
          percentChange: -100
        }
      }
    ]
  },
  {
    name: 'incidentTypeMetrics',
    content: []
  }
];

describe('sendEmail()', () => {
  it('should send a test email', (done) => {
    sendEmail('joe.chop@prominentedge.com', 'timerange', mergeVars)
      .then(() => {
        console.info('Sent email');
        done();
      })
      .catch(e => console.error(e))
  }).timeout(5000);
});
