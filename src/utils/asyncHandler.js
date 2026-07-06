// Enveloppe un contrôleur async pour transmettre les erreurs
// au gestionnaire central, sans try/catch répété partout.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
