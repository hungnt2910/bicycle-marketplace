const getStatus = (bike) => (bike?.status || '').toLowerCase();

// BE return flow currently sets returned bicycles to draft and clears inspection.
// We treat this specific draft shape as sellable again in public pages.
export const isReturnedDraftReadyForRelist = (bike) => {
  const status = getStatus(bike);
  const hasSoldHistorySignals =
    Boolean(bike?.soldAt) ||
    bike?.pricing?.isPaid === true ||
    Number(bike?.views || 0) > 0 ||
    Number(bike?.favoriteCount || 0) > 0;
  const isInspected = bike?.inspection?.isInspected === true;
  return status === 'draft' && hasSoldHistorySignals && !isInspected;
};

export const isBikePubliclySellable = (bike) => {
  const status = getStatus(bike);
  if (status === 'active') return true;
  if (isReturnedDraftReadyForRelist(bike)) return true;
  return false;
};

export const getPublicListingStatus = (bike) => {
  if (isBikePubliclySellable(bike)) return 'active';
  return getStatus(bike);
};
