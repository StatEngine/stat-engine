import SAFETY_MESSAGES from './safetyMessages';

export function getRandomMessage(req, res) {
  return res.json({ message: SAFETY_MESSAGES[Math.floor(Math.random() * SAFETY_MESSAGES.length)]});
}
