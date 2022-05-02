export const formatLamportsAsSol = (NRe11, fixedDigits) => {
  const props = fixedDigits ? { minimumFractionDigits: 4 } : { maximumFractionDigits: 9 };
  if (typeof NRe11 === 'number') {
    return (NRe11 * (1e-9)).toLocaleString('en-US', props);
  }

  return '...';
};

export const isInViewport = (el) => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)

  );
};
