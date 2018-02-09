'use strict';

import _ from 'lodash';

export default class MarketplaceHomeController {
  /*@ngInject*/
  constructor(extensions) {
    this.allExtensions = _.sortBy(extensions, (o) => o.name);

    this.filteredExtensions = this.allExtensions;
    this.filteredFeaturedExtensions = _.filter(this.allExtensions, (f) => f.featured)

    // build categories
    let categories = ['All'];
    angular.forEach(extensions, function(value, key) {
      categories = categories.concat(value.categories.split(','));
    });
    this.categories = _.orderBy(_.uniq(categories), 'desc');
    this.selectedCategory = 'All';
  }

  filterByCategory(searchCategory) {
    this.selectedCategory = searchCategory;

    if (searchCategory === 'All') {
      this.filteredExtensions = this.allExtensions;
      this.filteredFeaturedExtensions = _.filter(this.allExtensions, (f) => f.featured)
      return;
    }

    this.filteredExtensions = [];
    angular.forEach(this.allExtensions, (value, key) => {
      const categories = value.categories.split(',');
      if (categories.indexOf(searchCategory) >= 0) {
        this.filteredExtensions.push(value);
      }
    });

    this.filteredFeaturedExtensions = _.filter(this.filteredExtensions, (f) => f.featured)
  }
}
