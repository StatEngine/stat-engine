import 'chai/register-should';

import { Unit } from './unitList';

it('can create an instance', () => {
  const unit = Unit.create({ unitId: 'E1'});
  unit.unitId.should.equal('E1');
});

it('can change an instance', () => {
  const unit = Unit.create({ unitId: 'E1'});
  unit.unitId.should.equal('E1');
});
