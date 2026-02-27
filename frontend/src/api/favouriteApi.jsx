import axiosClient from '../services/axiosClient';

const favouriteApi = {
  addToFavourites: ({ userId, bicycleId }) =>
    axiosClient.post('/api/v1/bicycles/add-to-favourites', { userId, bicycleId }),

  getFavouriteBicycles: (userId) =>
    axiosClient.post('/api/v1/bicycles/get-favourite-bicycles', { userId }),

  removeOneFromFavourites: ({ userId, bicycleId }) =>
    axiosClient.delete('/api/v1/bicycles/removeOne-from-favourites', {
      data: { userId, bicycleId },
    }),

  removeAllFavourites: (userId) =>
    axiosClient.delete('/api/v1/bicycles/removeAll-from-favourites', {
      data: { userId },
    }),
};

export default favouriteApi;
