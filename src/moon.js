// Moon phase from the mean synodic month. Accurate to within about a day, which is enough for a daily page.
const SYNODIC = 29.530588853;            // days in one lunation
const REF_MS = Date.UTC(2000, 0, 6, 18, 14); // a known new moon (6 Jan 2000, 18:14 UTC)
const FULL_AGE = 14.765;                 // age in days at full moon

export function moonAge(ms) {
  const days = (ms - REF_MS) / 86400000;
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
  return age;
}

export function moonInfo(ms) {
  const age = moonAge(ms);
  const p = age / SYNODIC;
  const illumination = (1 - Math.cos(2 * Math.PI * p)) / 2; // 0 new, 1 full
  let name;
  if (age < 1.85 || age >= 27.7) name = 'New Moon';
  else if (age < 7.38) name = 'Waxing Crescent';
  else if (age < 9.23) name = 'First Quarter';
  else if (age < 13.7) name = 'Waxing Gibbous';
  else if (age < 15.7) name = 'Full Moon';
  else if (age < 22.15) name = 'Waning Gibbous';
  else if (age < 23.99) name = 'Last Quarter';
  else name = 'Waning Crescent';
  const waxing = age < SYNODIC / 2;
  const daysToFull = ((FULL_AGE - age) % SYNODIC + SYNODIC) % SYNODIC;
  const nextFullMs = ms + daysToFull * 86400000;
  return {
    name,
    age: Math.round(age * 10) / 10,
    illumination: Math.round(illumination * 100),
    waxing,
    nextFullMs,
  };
}
