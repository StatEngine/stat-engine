export default function combineMiddleware(mids) {
  return mids.reduce((a, b) => {
    return (req, res, next) => {
      a(req, res, (err) => {
        if (err) {
          return next(err);
        }
        b(req, res, next);
      });
    };
  });
};
