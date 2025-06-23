/**
 * Utility function to highlight code blocks in the blog post content.
 * Uses highlight.js for syntax highlighting.
 */

export function highlightCode(): void {
  // Dynamically import highlight.js only when needed (client-side)
  import('highlight.js')
    .then((hljs) => {
      // Select all code blocks within pre elements
      const codeBlocks = document.querySelectorAll('pre code')

      // Apply syntax highlighting to each code block
      codeBlocks.forEach((block) => {
        hljs.default.highlightElement(block as HTMLElement)
      })

      // Add copy button to each pre element containing code
      document.querySelectorAll('pre').forEach((preElement) => {
        // Skip if already has a copy button
        if (preElement.querySelector('.copy-button')) return

        // Create the copy button
        const copyButton = document.createElement('button')
        copyButton.className = 'copy-button'
        copyButton.textContent = 'Copy'
        copyButton.setAttribute('aria-label', 'Copy code to clipboard')
        copyButton.style.position = 'absolute'
        copyButton.style.top = '0.5rem'
        copyButton.style.right = '0.5rem'
        copyButton.style.padding = '0.25rem 0.5rem'
        copyButton.style.fontSize = '0.75rem'
        copyButton.style.fontWeight = 'medium'
        copyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
        copyButton.style.borderRadius = '0.25rem'
        copyButton.style.cursor = 'pointer'
        copyButton.style.border = 'none'
        copyButton.style.opacity = '0'
        copyButton.style.transition = 'opacity 0.2s'

        // Make sure pre has position relative for absolute positioning of button
        preElement.style.position = 'relative'

        // Создаем AbortController для управления событиями
        const abortController = new AbortController()
        const signal = abortController.signal

        // Сохраняем ссылку на AbortController в атрибуте элемента
        preElement.setAttribute(
          'data-abort-controller-id',
          Math.random().toString(36).substring(2, 9),
        )
        ;(window as any)[preElement.getAttribute('data-abort-controller-id')!] = abortController

        // Show button on hover
        preElement.addEventListener(
          'mouseenter',
          () => {
            copyButton.style.opacity = '1'
          },
          { signal },
        )

        preElement.addEventListener(
          'mouseleave',
          () => {
            copyButton.style.opacity = '0'
            // Reset button text if it was changed
            if (copyButton.textContent !== 'Copy') {
              setTimeout(() => {
                copyButton.textContent = 'Copy'
              }, 300)
            }
          },
          { signal },
        )

        // Очистка при уничтожении элемента
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.removedNodes.length) {
              for (let i = 0; i < mutation.removedNodes.length; i++) {
                const node = mutation.removedNodes[i]
                if (node === preElement) {
                  // Отменяем все события
                  abortController.abort()
                  // Удаляем ссылку на AbortController
                  delete (window as any)[preElement.getAttribute('data-abort-controller-id')!]
                  // Отключаем наблюдатель
                  observer.disconnect()
                }
              }
            }
          })
        })

        // Наблюдаем за родительским элементом
        if (preElement.parentNode) {
          observer.observe(preElement.parentNode, { childList: true })
        }

        // Handle copy action
        copyButton.addEventListener(
          'click',
          () => {
            const codeElement = preElement.querySelector('code')
            if (codeElement) {
              navigator.clipboard
                .writeText(codeElement.textContent || '')
                .then(() => {
                  copyButton.textContent = 'Copied!'
                  setTimeout(() => {
                    copyButton.textContent = 'Copy'
                  }, 2000)
                })
                .catch((err) => {
                  logError('Failed to copy code:', err)
                  copyButton.textContent = 'Error!'
                })
            }
          },
          { signal },
        )

        // Add button to pre element
        preElement.appendChild(copyButton)
      })
    })
    .catch((error) => {
      logError('Failed to load highlight.js:', error)
    })
}
