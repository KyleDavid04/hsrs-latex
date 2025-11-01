import React, { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface RichTextProps {
  value?: string
  className?: string
}

function escapeSegment(segment: string) {
  return segment
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;(\/?)ruby&gt;/g, '<$1ruby>')
    .replace(/&lt;(\/?)rt&gt;/g, '<$1rt>')
    .replace(/&lt;wbr\/?&gt;/g, '<wbr/>')
}

function renderLatex(content?: string) {
  if (!content) return ''

  const latexRegex = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g
  let match: RegExpExecArray | null
  let html = ''
  let lastIndex = 0

  while ((match = latexRegex.exec(content))) {
    const [fullMatch, blockContent, inlineContent] = match
    if (match.index > lastIndex)
      html += escapeSegment(content.slice(lastIndex, match.index))

    try {
      html += katex.renderToString(blockContent ?? inlineContent ?? '', {
        throwOnError: false,
        displayMode: !!blockContent,
      })
    } catch (err) {
      html += escapeSegment(fullMatch)
    }

    lastIndex = match.index + fullMatch.length
  }

  if (lastIndex < content.length)
    html += escapeSegment(content.slice(lastIndex))
  return html
}

export function RichText(props: RichTextProps) {
  const rendered = useMemo(() => renderLatex(props.value), [props.value])

  if (!props.value) return null

  return <div className={props.className} dangerouslySetInnerHTML={{ __html: rendered }} />
}

