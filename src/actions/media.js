import { CALL_API } from '../middleware/api'
import { Schemas } from '../constants/entities'
import * as actionTypes from '../constants/actionTypes'
import { API_ROUTES } from '../constants/urls'

// fetch user request
// Relies on the custom API middleware defined in ../middleware/api.js.
export const fetchAllMedia = () => ({
  [CALL_API]: {
    type: actionTypes.FETCH_ALL_MEDIA,
    endpoint: `${API_ROUTES.basic}/media`,
    schema: Schemas.MEDIA_ARRAY,
  },
})

export const fetchMedia = id => ({
  [CALL_API]: {
    type: actionTypes.FETCH_MEDIA,
    endpoint: `${API_ROUTES.basic}/media/${id}`,
    schema: Schemas.MEDIA,
  },
})
