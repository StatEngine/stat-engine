'use strict';

import axios from 'axios';

export default function KibanaService() {
  'ngInject';

  return {
    async refreshAuth({ workspaceId }) {
      const response = await axios.get(`/workspaces/${workspaceId}/login`);
      await axios.get(response.data.kibanaLoginUrl);
    },

    updateWorkspaceDashboards({ workspaceId, dashboardIds }) {
      // this.refreshAuth({ workspaceId });
      // const response = await axios.
    },
  };
}
