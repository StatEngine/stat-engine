import { Unit } from './unitList';
import 'chai/register-should';

it('can create an instance', () => {
  const unit = Unit.create({ unitId: 'E1'});
  unit.unitId.should.equal('E1');
});

it('can change an instance', () => {
  const unit = Unit.create({ unitId: 'E1'});
  unit.unitId.should.equal('E1');
});
