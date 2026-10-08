import JSCPP from 'JSCPP'

self.onmessage = ({ data }) => {
  try {
    let output = ''
    const exitCode = JSCPP.run(data.code, data.input, {
      stdio: {
        write: (text) => {
          output += text
          if (output.length > 12000)
            throw new Error(
              'Output limit reached (12,000 characters). Check your loop conditions.',
            )
        },
      },
    })
    self.postMessage({ output, exitCode })
  } catch (error) {
    self.postMessage({ error: String(error.message || error).slice(0, 1500) })
  }
}
