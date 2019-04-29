'use strict';

export default class DashboardTenancyController {
  /*@ngInject*/
  constructor(currentPrincipal, $window) {
    this.$window = $window;

    this.tenants = [{
      slug: currentPrincipal.FireDepartment.firecares_id,
      name: 'My Department',
      short_description: currentPrincipal.FireDepartment.name,
      image: currentPrincipal.FireDepartment.logo_link,
    }];

    if (currentPrincipal.isGlobal) {
      this.tenants.push({
        slug: 'global',
        name: 'Global',
        short_description: 'All Departments',
        image: '/assets/images/nfors-branding-symbol.png',
      });
    }
  }

  select(tenant) {
    this.$window.location.href = '/dashboard?tenancy=' + tenant.slug;
  }
}
