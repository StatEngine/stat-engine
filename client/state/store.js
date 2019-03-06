import { UnitList } from './models/unitList';

class RootStore {
  constructor() {
    this.unitStore = UnitList.create({ units: [] });
  }
}

const Store = new RootStore();
export { Store };

export default Store;
