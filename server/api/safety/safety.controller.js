import seedrandom from 'seedrandom';
import SAFETY_MESSAGES from './safetyMessages';

export function getRandomMessage(req, res) {
  const now = new Date();
  const fullDaysSinceEpoch = Math.floor(now / 8.64e7);
  const rng = seedrandom(fullDaysSinceEpoch);

  return res.json({ message: SAFETY_MESSAGES[Math.floor(rng() * SAFETY_MESSAGES.length)]});
}

export default getRandomMessage;
