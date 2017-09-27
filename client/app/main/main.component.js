import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {
  awesomeThings = [];
  newThing = 'test';
  intros = [
    {
      img: '/assets/images/safety.svg',
      title: 'Increase Safety, Decrease Costs',
      content: `Real-time data analysis drives decision making,
        which means a faster, better response to public safety demands.
        Our platform makes this technology available to the organization at
        little to no cost - and it’s easy to implement!`
    },
    {
      img: '/assets/images/analytics.svg',
      title: 'Better Analytics, Better Operations',
      content: `Accelerated, accurate data analytics enables
      organizations to scrutinize staffing levels, standard
      operating procedures and internal policies, training efforts
      and resource deployments quickly and easily.`
    },
    {
      img: '/assets/images/thumb-up.svg',
      title: 'Easy to Install, Easy to Use',
      content: `Automated scripts make install a breeze. Configure and customize,
      without specialized knowledge of the tools or in-house technical experts.
      Don’t want to host it yourself? We deploy in the cloud as well.`
    },
    {
      img: '/assets/images/improvement.svg',
      title: 'Continuous Improvement',
      content: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Phasellus hendrerit.
      Pellentesque aliquet nibh nec urna. In nisi neque, aliquet vel, dapibus id, mattis vel, nisi.
       Sed pretium, ligula sollicitudin.`
    }
  ];

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });
  }

  addThing() {
    if(this.newThing) {
      this.$http.post('/api/things', {
        name: this.newThing
      });
      this.newThing = '';
    }
  }

  deleteThing(thing) {
    this.$http.delete(`/api/things/${thing._id}`);
  }
}

export default angular.module('assApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
