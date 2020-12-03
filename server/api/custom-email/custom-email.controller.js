export async function find(req, res) {
  res.status(204).json({
    msg: 'custom email find',
  });
}

export async function list(req, res) {
  res.status(204).json({
    msg: 'custom email list',
  });
}
export async function create(req, res) {
  res.status(204).json({
    msg: 'custom email create',
  });
}

export async function update(req, res) {
  res.status(204).json({
    msg: 'custom email update',
  });
}

export async function deleteCustomEmail(req, res) {
  res.status(204).json({
    msg: 'custom email delete',
  });
}
