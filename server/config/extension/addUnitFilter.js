import {
  Extension,
} from '../../sqldb';
import UnitFilterFixture from '../../fixtures/extensions/unitFilters';

export default async function() {
  const extension = await Extension.find({
    where: {
      name: UnitFilterFixture.name
    }
  });

  if (!extension) {
    await Extension.create(UnitFilterFixture);
  } else {
    console.log('Unit Filtering Extension already created. Skipping.')
  }

}