import { UnitList } from './models/unitList';
import { UI } from './models/ui';

class RootStore {
  constructor() {
    this.unitStore = UnitList.create({ units: [] })
    this.uiStore = UI.create({})
  }
}

const Store = new RootStore();
export { Store };
