export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}
