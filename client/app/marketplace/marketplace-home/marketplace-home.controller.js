/* eslint  class-methods-use-this: 0 */

'use strict';

import angular from 'angular';
import _ from 'lodash';

function importAll(r) {
  let images = {};
  r.keys().map(item => { images[item.replace('./', '')] = r(item); return images; });
  return images;
}

const images = importAll(require.context('../../../assets/images/extensions/', false, /\.(png|jpe?g|svg)$/));

export default class MarketplaceHomeController {
  /*@ngInject*/
  constructor(extensions) {
    this.allExtensions = _.sortBy(extensions, o => o.name);

    this.filteredExtensions = this.allExtensions;
    this.filteredFeaturedExtensions = _.filter(this.allExtensions, f => f.featured);

    // build categories
    let categories = ['All'];
    angular.forEach(extensions, value => {
      categories = categories.concat(value.categories.split(','));
    });
    this.categories = _.orderBy(_.uniq(categories), 'desc');
    this.selectedCategory = 'All';
  }

  loadImage(path) {
    return images[path];
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
