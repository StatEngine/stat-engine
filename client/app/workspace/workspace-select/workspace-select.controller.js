'use strict';

export default class WorkspaceSelectController {
  /*@ngInject*/
  constructor(currentPrincipal, $window, workspaces) {
    this.$window = $window;

    this.workspaces = workspaces;

    /*[{
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
    }*/
  }

  select(workspace) {
    this.$window.location.href = '/dashboard?workspace=' + workspace.id;
  }
}
