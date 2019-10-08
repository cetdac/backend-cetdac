'use strict'

/**
 * HTTP Status codes
 */
const codes = {
  CONTINUE: 100,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIME_OUT: 504
}

function responseHandler () {
  return async (ctx, next) => {
    ctx.res.codes = codes
    ctx.codes = ctx.res.codes

    ctx.res.success = ({ code, body = null }) => {
      if (code && (code < 400)) {
        ctx.status = code
      } else if (!(ctx.status < 400)) {
        ctx.status = codes.OK
      }

      ctx.status = code
      ctx.body = body
    }

    ctx.res.fail = ({ code, body = null, message = null }) => {
      if (!!code && (code >= 400 && code < 500)) {
        ctx.status = code
      } else if (!(ctx.status >= 400 && ctx.status < 500)) {
        ctx.status = codes.BAD_REQUEST
      }

      ctx.body = { code, body, message }
    }

    ctx.res.error = ({ code, body = null, message = null }) => {

      if (!!code && (code >= 500 && code < 600)) {
        ctx.status = code
      } else if (!(ctx.status >= 500 && ctx.status < 600)) {
        ctx.status = codes.INTERNAL_SERVER_ERROR
      }

      ctx.body = { code, body, message }
    }

    ctx.res.ok = (params = {}) => {
      ctx.res.success({
        ...params,
        code: codes.OK
      })
    }

    ctx.res.created = (params = {}) => {
      ctx.res.success({
        ...params,
        code: codes.CREATED
      })
    }

    ctx.res.accepted = (params = {}) => {
      ctx.res.success({
        ...params,
        code: codes.ACCEPTED
      })
    }

    ctx.res.noContent = (params = {}) => {
      ctx.res.success({
        ...params,
        code: codes.NO_CONTENT
      })
    }

    ctx.res.badRequest = (params = {}) => {
      ctx.res.fail({
        ...params,
        code: codes.BAD_REQUEST
      })
    }

    ctx.res.unauthorized = (params = {}) => {
      ctx.res.fail({
        ...params,
        code: codes.UNAUTHORIZED
      })
    }

    ctx.res.forbidden = (params = {}) => {
      ctx.res.fail({
        ...params,
        code: codes.FORBIDDEN
      })
    }

    ctx.res.notFound = (params = {}) => {
      ctx.res.fail({
        ...params,
        code: codes.NOT_FOUND
      })
    }

    ctx.res.requestTimeout = (params = {}) => {
      ctx.res.fail({
        ...params,
        code: codes.REQUEST_TIMEOUT
      })
    }

    ctx.res.unprocessableEntity = (params = {}) => {
      ctx.res.fail({
        ...params,
        code: codes.UNPROCESSABLE_ENTITY
      })
    }

    ctx.res.internalServerError = (params = {}) => {
      ctx.res.error({
        ...params,
        code: codes.INTERNAL_SERVER_ERROR
      })
    }

    ctx.res.notImplemented = (params = {}) => {
      ctx.res.error({
        ...params,
        code: codes.NOT_IMPLEMENTED
      })
    }

    ctx.res.badGateway = (params = {}) => {
      ctx.res.error({
        ...params,
        code: codes.BAD_GATEWAY
      })
    }

    ctx.res.serviceUnavailable = (params = {}) => {
      ctx.res.error({
        ...params,
        code: codes.SERVICE_UNAVAILABLE
      })
    }

    ctx.res.gatewayTimeOut = (params = {}) => {
      ctx.res.error({
        ...params,
        code: codes.GATEWAY_TIME_OUT
      })
    }
    await next()
  }
}

module.exports = responseHandler
