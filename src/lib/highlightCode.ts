import hljs from 'highlight.js'

interface HighlightOptions {
  addCopyButton?: boolean
  copyButtonText?: string
  copiedButtonText?: string
  copyTimeout?: number
  wrapLines?: boolean
  lineNumbers?: boolean
}

/**
 * Highlight code blocks in a container element
 * @param container The container element with code blocks
 * @param options Highlighting options
 */
export function highlightCodeBlocks(container: HTMLElement, options: HighlightOptions = {}): void {
  if (!container) return

  const {
    addCopyButton = true,
    copyButtonText = 'Copy',
    copiedButtonText = 'Copied!',
    copyTimeout = 2000,
    wrapLines = false,
    lineNumbers = false,
  } = options

  // Find all pre > code elements
  const codeBlocks = container.querySelectorAll('pre code')

  codeBlocks.forEach((codeBlock) => {
    const preElement = codeBlock.parentElement
    if (!preElement) return

    // Add class for line wrapping if enabled
    if (wrapLines) {
      preElement.classList.add('whitespace-pre-wrap')
    }

    // Apply syntax highlighting
    hljs.highlightElement(codeBlock as HTMLElement)

    // Get language class if available
    const langClass = Array.from(codeBlock.classList).find((cls) => cls.startsWith('language-'))
    const language = langClass ? langClass.replace('language-', '') : ''

    // Add language label if we have one
    if (language) {
      const langLabel = document.createElement('div')
      langLabel.className =
        'code-language absolute top-2 right-2 rounded bg-gray-700 px-2 py-1 text-xs text-gray-200'
      langLabel.textContent = language
      preElement.classList.add('relative')
      preElement.appendChild(langLabel)
    }

    // Add line numbers if enabled
    if (lineNumbers) {
      const code = codeBlock.textContent || ''
      const lineCount = code.split('\n').length

      const lineNumbersContainer = document.createElement('div')
      lineNumbersContainer.className = 'line-numbers select-none text-gray-500 pr-4 text-right'

      let linesHtml = ''
      for (let i = 1; i <= lineCount; i++) {
        linesHtml += `<div class="line-number">${i}</div>`
      }

      lineNumbersContainer.innerHTML = linesHtml

      // Create a wrapper to hold both line numbers and code
      const wrapper = document.createElement('div')
      wrapper.className = 'code-with-line-numbers flex'

      // Move the code block to the wrapper
      const codeContent = codeBlock.cloneNode(true)
      wrapper.appendChild(lineNumbersContainer)
      wrapper.appendChild(codeContent)

      // Replace the original code block with the wrapped version
      preElement.innerHTML = ''
      preElement.appendChild(wrapper)
    }

    // Add copy button if enabled
    if (addCopyButton) {
      const copyButton = document.createElement('button')
      copyButton.className =
        'copy-button absolute top-2 right-2 rounded bg-gray-700 px-2 py-1 text-xs text-gray-200 hover:bg-gray-600'
      copyButton.textContent = copyButtonText

      // Move language label if it exists
      if (language) {
        const langLabel = preElement.querySelector('.code-language')
        if (langLabel) {
          langLabel.className =
            'code-language absolute top-2 right-[70px] rounded bg-gray-700 px-2 py-1 text-xs text-gray-200'
        }
      }

      copyButton.addEventListener('click', () => {
        // Get text content from the code block
        const text = codeBlock.textContent || ''

        // Copy to clipboard
        navigator.clipboard
          .writeText(text)
          .then(() => {
            copyButton.textContent = copiedButtonText
            copyButton.classList.add('bg-green-700')
            copyButton.classList.remove('bg-gray-700')

            // Reset button text after timeout
            setTimeout(() => {
              copyButton.textContent = copyButtonText
              copyButton.classList.remove('bg-green-700')
              copyButton.classList.add('bg-gray-700')
            }, copyTimeout)
          })
          .catch((err) => {
            console.error('Failed to copy code: ', err)
            copyButton.textContent = 'Error!'
            copyButton.classList.add('bg-red-700')
            copyButton.classList.remove('bg-gray-700')

            setTimeout(() => {
              copyButton.textContent = copyButtonText
              copyButton.classList.remove('bg-red-700')
              copyButton.classList.add('bg-gray-700')
            }, copyTimeout)
          })
      })

      preElement.classList.add('relative')
      preElement.appendChild(copyButton)
    }
  })
}

/**
 * Apply code highlighting to a string of HTML
 * This can be used for server-side rendering
 * @param html HTML string containing code blocks
 * @returns HTML string with highlighted code
 */
export function highlightCodeInHtml(html: string): string {
  if (!html) return html

  // Create a DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Find all code blocks
  const codeBlocks = doc.querySelectorAll('pre code')

  codeBlocks.forEach((codeBlock) => {
    // Get the code content
    const code = codeBlock.textContent || ''
    const language =
      Array.from(codeBlock.classList)
        .find((cls) => cls.startsWith('language-'))
        ?.replace('language-', '') || ''

    // Apply highlighting based on language if available
    let highlightedCode
    if (language) {
      try {
        highlightedCode = hljs.highlight(code, { language }).value
      } catch (e) {
        highlightedCode = hljs.highlightAuto(code).value
      }
    } else {
      highlightedCode = hljs.highlightAuto(code).value
    }

    // Replace the content with highlighted code
    codeBlock.innerHTML = highlightedCode
  })

  // Convert back to string
  return doc.body.innerHTML
}

/**
 * Register custom languages or aliases for highlight.js
 * Call this before using any highlighting functions
 */
export function registerCustomLanguages(): void {
  // Example: Register an alias for a language
  // hljs.registerAliases('js', { languageName: 'javascript' });
  // You can add more custom language registrations here
}
