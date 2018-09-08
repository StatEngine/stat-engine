export function getUnits(req, res) {
  res.json([{
    unitId: 'E1',
  }, {
    unitId: 'E2',
  }])
}

export function getUnitStats(req, res) {
  res.json({
    reponseTime: Math.random()
  })
}
