import { normalize } from 'normalizr'
import { camelizeKeys } from 'humps'

import { API_URL } from '../constants/urls'
import { toQueryString } from '../utils'

const defaultHTTPHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}
// Fetches an API response.
// This makes every API response have the same shape, regardless of how nested it was.
const callApi = ({ endpoint, method, payload, options = {} }, schema) => {
  const query = toQueryString(options)
  const url = `${API_URL}${endpoint}${query ? '?' : ''}${query}`
  const config = {
    headers: defaultHTTPHeaders,
    method: method || 'GET',
    body: JSON.stringify(payload),
    credentials: 'include', // send a request with credentials included, send cookies to Passport to confirm session
  }

  if (config.method === 'GET' || config.method === 'DELETE') {
    config.body = null
  }

  return fetch(url, config)
    .then(response =>
      response.json().then(json => {
        if (!response.ok) {
          return Promise.reject(json)
        }

        const camelizedJson = camelizeKeys(
          json,
          // if the key is all upperCase convert it to lowercase
          (key, convert) => (/^[A-Z0-9_]+$/.test(key) ? key.toLowerCase() : convert(key)),
        )

        return schema ? {
          ...normalize(camelizedJson, schema),
        } : camelizedJson
      }),
    )
}

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = 'Call API'

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  const callAPI = action[CALL_API]
  if (typeof callAPI === 'undefined') {
    return next(action)
  }

  let { endpoint } = callAPI
  const { schema, type, suppressError } = callAPI
  const types = [
    type,
    `${type}_SUCCESS`,
    `${type}_FAILURE`,
  ]

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState())
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(t => typeof t === 'string')) {
    throw new Error('Expected action types to be strings.')
  }

  const actionWith = data => {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[CALL_API]
    return finalAction
  }

  const [requestType, successType, failureType] = types
  next(actionWith({ type: requestType, isLoading: true }))

  return callApi(callAPI, schema).then(
    response => next(actionWith({
      response,
      type: successType,
      success: response.success,
      isLoading: false,
    })),
    error => next(actionWith({
      suppressError,
      type: failureType,
      error: error.error || 'Something bad happened',
      isLoading: false,
    })),
  )
}
