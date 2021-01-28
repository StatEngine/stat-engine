import fs from 'fs';

export default function loadJson(path, fileName) {
  const rawData = fs.readFileSync(`${path}/${fileName}`);
  return JSON.parse(rawData);
}
