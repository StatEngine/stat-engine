'use strict';

let _;

export default class EffectiveResponseForceComponent {
  initialized = false;

  constructor($window) {
    'ngInject';

    this.$window = $window;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.layout = {
      xaxis: {
        title: '# of personnel arriving',
        dtick: 1,
      },
      yaxis: {
        title: 'Duration (min)',
        titlefont: {
          color: '#007bff'
        },
        tickfont: {
          color: '#007bff'
        },
      },
      yaxis2: {
        title: '# of Incidents',
        titlefont: {
          color: '#dc3545'
        },
        tickfont: {
          color: '#dc3545'
        },
        overlaying: 'y',
        side: 'right'
      },
      shapes: [],
    };

    this.updatePlot();

    this.initialized = true;
  }

  $onChanges() {
    if(!this.initialized) {
      return;
    }

    this.updatePlot();
  }

  updatePlot() {
    if (this.data) {
      let erfTravel = {
        x: [],
        y: [],
        type: 'scatter',
        name: '90th Percentile ERF Travel',
        line: {
          dash: 'dot',
          color: '#007bff'
        }
      };

      let erfResponse = {
        x: [],
        y: [],
        type: 'scatter',
        name: '90th Percentile ERF Response',
        line: {
          dash: 'dashdot',
          color: '#007bff'
        }
      };

      let erfTotalResonse = {
        x: [],
        y: [],
        type: 'scatter',
        name: '90th Percentile ERF Total Response',
        line: {
          dash: 'solid',
          color: '#007bff'
        }
      };

      let incidentCounts = {
        x: [],
        y: [],
        yaxis: 'y2',
        type: 'scatter',
        name: '# of incidents'
      };

      _.forOwn(this.data.historic, (value, key) => {
        // if at least one value exists
        if (getY(value, 'erf_travel')) {
          erfTravel.x.push(key);
          erfResponse.x.push(key);
          erfTotalResonse.x.push(key);
          incidentCounts.x.push(key);

          erfTravel.y.push(getY(value, 'erf_travel'));
          erfResponse.y.push(getY(value, 'erf_response'));
          erfTotalResonse.y.push(getY(value, 'erf_total_response'));
          incidentCounts.y.push(_.get(value, 'num_of_incidents'));
        }
      })

      this.erfTravel = erfTravel;
      this.incidentCounts = incidentCounts;
      this.currentConfig = this.data.current_config;

      this.trace = [erfTravel, erfResponse, erfTotalResonse, incidentCounts];
      if (this.data.current_config) {
        let maxX = erfTravel.x[erfTravel.y.length-1];
        let current = {
          x: [this.data.current_config.erf + (Number(maxX)-this.data.current_config.erf)/2],
          y: [_.max(erfTotalResonse.y)+1],
          mode: 'text',
          text: [`ERF Compliance`],
          showlegend: false,
        };
        this.trace.push(current);

        this.layout.shapes = [
          {
              type: 'rect',
              // x-reference is assigned to the x-values
              xref: 'x',
              // y-reference is assigned to the plot paper [0,1]
              yref: 'paper',
              x0: this.data.current_config.erf,
              y0: 0,
              x1: maxX,
              y1: 1,
              fillcolor: '#98ee90',
              opacity: 0.2,
              line: {
                  width: 0
              },
              text: 'current',
          },
        ]
      }
    }
  }
}

function getY(obj, path, ) {
  let raw = _.get(obj, path);
  if (_.isNil(raw)) return null;

  return raw/60000;
}

function safePush(key, dest) {
  if (key) dest.push(key);
}