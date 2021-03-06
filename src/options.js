const path = require('path')
const {
  isObject, isString, isNumber, isBoolean, isFunction
} = require('core-util-is')
const {error} = require('./error')

const DEFAULT_CLUSTER = 'default'
const DEFAULT_NAMESPACE = 'application'
const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000

const ATOM_RETRY_DELAY = 10 * 1000
const DEFAULT_POLLING_RETRY_POLICY = retries => {
  const ret = {
    // Testing: allow tests cases to change the value
    delay: retries * module.exports.ATOM_RETRY_DELAY,
    reset: false
  }

  // Longer than 60 is non-sense,
  // because the max response time of
  if (retries >= 6) {
    ret.reset = true
  }

  return ret
}

const RULES = {
  host: {
    validate: isString,
  },
  appId: {
    validate: isString
  },
  cluster: {
    validate: isString
  },
  namespace: {
    validate: isString
  },
  ip: {
    validate: isString,
    optional: true
  },
  dataCenter: {
    validate: isString,
    optional: true
  },
  fetchInterval: {
    validate: isNumber
  },
  fetchCachedConfig: {
    validate: isBoolean
  },
  enableUpdateNotification: {
    validate: isBoolean
  },
  pollingRetryPolicy: {
    validate: isFunction
  },
  skipInitFetchIfCacheFound: {
    validate: isBoolean
  },
  enableFetch: {
    validate: isBoolean
  },
  cachePath: {
    validate: isString,
    optional: true,
    set: path.resolve
  }
}

const KEYS = Object.keys(RULES)

const ensureType = object => {
  KEYS.forEach(key => {
    const {
      validate,
      optional,
      set
    } = RULES[key]

    const v = object[key]

    if (optional && v === undefined) {
      return
    }

    if (validate && !validate(v)) {
      throw error(`INVALID_${key.toUpperCase()}`, v)
    }

    // Setters can throw
    // For now, this is useless
    if (set) {
      object[key] = set(v)
    }
  })

  return object
}

const checkOptions = options => {
  if (!isObject(options)) {
    throw error('INVALID_OPTIONS', options)
  }

  const {
    host,
    appId,
    cluster = DEFAULT_CLUSTER,
    namespace = DEFAULT_NAMESPACE,
    ip,
    dataCenter,
    fetchInterval = DEFAULT_REFRESH_INTERVAL,
    fetchCachedConfig = true,
    enableUpdateNotification = true,
    pollingRetryPolicy = DEFAULT_POLLING_RETRY_POLICY,
    skipInitFetchIfCacheFound = false,
    enableFetch = false,
    cachePath
  } = options

  return ensureType({
    host,
    appId,
    cluster,
    namespace,
    ip,
    dataCenter,
    fetchInterval,
    fetchCachedConfig,
    enableUpdateNotification,
    pollingRetryPolicy,
    skipInitFetchIfCacheFound,
    enableFetch,
    cachePath
  })
}

const DEFAULT_NAMESPACE_TYPE = 'PROPERTIES'
const AVAILABLE_NAMESPACE_TYPES = [
  DEFAULT_NAMESPACE_TYPE,
  'JSON'
]

const checkNamespaceType = type => {
  if (!AVAILABLE_NAMESPACE_TYPES.includes(type)) {
    throw error('INVALID_NAMESPACE_TYPE', type)
  }
}

const AVAILABLE_OPTIONS = Object.keys(RULES)

module.exports = {
  checkOptions,
  checkNamespaceType,
  AVAILABLE_OPTIONS,
  DEFAULT_CLUSTER,
  DEFAULT_NAMESPACE,
  DEFAULT_NAMESPACE_TYPE,
  ATOM_RETRY_DELAY
}
