const normalizeError = (error) => {
  if (!error) {
    return { message: '알 수 없는 오류' }
  }

  return {
    name: error.name,
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    code: error.code,
  }
}

const writeLog = (method, prefix, message, data) => {
  if (data === undefined) {
    console[method](prefix, message)
    return
  }

  console[method](prefix, message, data)
}

export const createDebugLogger = (scope) => {
  const prefix = `[WeatherApp:${scope}]`

  return {
    input(message, data) {
      writeLog('info', prefix, `입력 | ${message}`, data)
    },
    state(message, data) {
      writeLog('info', prefix, `상태 | ${message}`, data)
    },
    success(message, data) {
      writeLog('info', prefix, `성공 | ${message}`, data)
    },
    warn(message, data) {
      writeLog('warn', prefix, `주의 | ${message}`, data)
    },
    error(message, error, data = {}) {
      writeLog('error', prefix, `오류 | ${message}`, {
        ...data,
        error: normalizeError(error),
      })
    },
  }
}
