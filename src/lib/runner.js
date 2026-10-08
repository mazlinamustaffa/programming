export function runCpp(code, input = '') {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/cpp.worker.js', import.meta.url),
      { type: 'module' },
    )
    const finish = () => {
      clearTimeout(timer)
      worker.terminate()
    }
    const timer = setTimeout(() => {
      finish()
      reject(
        new Error(
          'Execution stopped after 5 seconds. Check for an infinite loop and try again.',
        ),
      )
    }, 5000)
    worker.onmessage = ({ data }) => {
      finish()
      if (data.error) reject(new Error(data.error))
      else resolve(data)
    }
    worker.onerror = () => {
      finish()
      reject(
        new Error(
          'The C++ practice runtime could not start. Refresh the page and try again.',
        ),
      )
    }
    worker.postMessage({ code, input })
  })
}
