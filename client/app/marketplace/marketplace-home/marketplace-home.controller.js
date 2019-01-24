/* eslint  class-methods-use-this: 0 */

'use strict';

import angular from 'angular';

let _;

function importAll(r) {
  let images = {};
  r.keys().map(item => {
    images[item.replace('./', '')] = r(item); return images;
  });
  return images;
}

const images = importAll(require.context('../../../assets/images/extensions/', false, /\.(png|jpe?g|svg)$/));

export default class MarketplaceHomeController {
  /*@ngInject*/
  constructor(apps, extensions, $state) {
    this.allExtensions = extensions;
    this.allApps = apps;
    this.$state = $state;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();
    this.allApps = _.map(this.allApps, a => _.merge(a, { type: 'App' }))
    this.allExtensions = _.sortBy(this.allExtensions.concat(this.allApps), o => o.name);
    this.filteredExtensions = this.allExtensions;
    this.filteredFeaturedExtensions = _.filter(this.allExtensions, f => f.featured);

    // build categories
    let categories = ['All'];
    angular.forEach(this.allExtensions, value => {
      if(value.categories) categories = categories.concat(value.categories.split(','));
    });
    this.categories = _.orderBy(_.uniq(categories), 'desc');
    this.selectedCategory = 'All';
  }

  loadImage(path) {
    return images[path];
  }

  goto(extension) {
    if(extension.type === 'App') this.$state.go('site.marketplace.applicationInstall', { id: extension._id });
    else this.$state.go('site.marketplace.extensionRequest', { id: extension._id });
  }

  filterByCategory(searchCategory) {
    this.selectedCategory = searchCategory;

    if(searchCategory === 'All') {
      this.filteredExtensions = this.allExtensions;
      this.filteredFeaturedExtensions = _.filter(this.allExtensions, f => f.featured);
      return;
    }

    this.filteredExtensions = [];
    angular.forEach(this.allExtensions, value => {
      const categories = value.categories.split(',');
      if(categories.indexOf(searchCategory) >= 0) {
        this.filteredExtensions.push(value);
      }
    });

    this.filteredFeaturedExtensions = _.filter(this.filteredExtensions, f => f.featured);
  }
}
