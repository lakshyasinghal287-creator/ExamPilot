import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
}

/**
 * Preprocesses raw question/passage text:
 *  - Unescapes literal `\n` characters
 *  - Formats concatenated numbered sentences (e.g., Para-Jumbles, Odd-Sentence-Out)
 *    so each sentence (1., 2., 3., 4., 5.) starts on its own paragraph
 *  - Converts un-delimited math notations like `log_2(3)` into KaTeX `\log_{2}(3)`
 *  - Wraps orphan LaTeX macros (`\le`, `\ge`, `\pm`, etc.) in `$...$`
 */
function preprocessText(raw: string): string {
  if (!raw) return '';

  let text = raw
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n');

  // Format concatenated numbered sentences onto new lines
  // e.g., "...in the input box. 1. Urban microclimates... 2. This phenomenon..."
  text = text.replace(/([.!?:]|input box\.?)\s+([1-5]\.\s+)/gi, '$1\n\n$2');
  text = text.replace(/([.!?:]|input box\.?)\s+(\([1-5]\)\s+)/gi, '$1\n\n$2');
  // Handle numbered sentences with period right before: e.g. "policy. 3. Mitigating..."
  text = text.replace(/([a-zA-Z0-9)\]])\.\s+([1-5]\.\s+)/g, '$1.\n\n$2');

  // Convert un-delimited log notation: log_2(3) -> $\log_{2}(3)$
  text = text.replace(/(?<!\$)\blog_([0-9a-zA-Z]+)\(([^)]+)\)(?!\$)/g, '$\\log_{$1}($2)$');

  // Clean orphan LaTeX commands not already wrapped in $
  // e.g. text containing \le or \ge or \neq or \pm without any $
  const lines = text.split('\n');
  const processedLines = lines.map((line) => {
    if (!line.includes('$') && /\\(le|ge|neq|pm|times|approx|sqrt)\b/.test(line)) {
      // Wrap the mathematical inequality expression in inline math $...$
      return line.replace(/([0-9a-zA-Z_|()+\-*/^ ]*\\(le|ge|neq|pm|times|approx)[0-9a-zA-Z_|()+\-*/^ ]*)/g, '$$$1$$');
    }
    return line;
  });

  return processedLines.join('\n');
}

/**
 * Renders a text string with:
 *  - LaTeX math expressions ($$...$$ for display, $...$ for inline) via KaTeX
 *  - Newline characters (\n) as paragraph blocks or line breaks
 *  - Styled numbered sentences for authentic CAT CBT appearance
 */
export const MathText: React.FC<MathTextProps> = ({ text }) => {
  if (!text) return null;

  const preprocessed = preprocessText(text);

  // Regex matches: $$display math$$ OR $inline math$
  const mathRegex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

  const segments: { type: 'text' | 'display' | 'inline'; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(preprocessed)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: preprocessed.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      segments.push({ type: 'display', content: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ type: 'inline', content: match[2] });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < preprocessed.length) {
    segments.push({ type: 'text', content: preprocessed.slice(lastIndex) });
  }

  return (
    <span>
      {segments.map((seg, i) => {
        if (seg.type === 'display') {
          try {
            const html = katex.renderToString(seg.content, {
              throwOnError: false,
              displayMode: true,
            });
            return (
              <span
                key={i}
                className="my-3 block overflow-x-auto py-1 text-center font-serif text-base"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={i} className="font-mono text-stone-700">{`$$${seg.content}$$`}</span>;
          }
        }

        if (seg.type === 'inline') {
          try {
            const html = katex.renderToString(seg.content, {
              throwOnError: false,
              displayMode: false,
            });
            return (
              <span
                key={i}
                className="inline-block px-0.5 font-serif"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={i} className="font-mono text-stone-700">{`$${seg.content}$`}</span>;
          }
        }

        // Plain text segments — handle newlines with clean paragraph spacing
        const lines = seg.content.split('\n');
        return (
          <React.Fragment key={i}>
            {lines.map((line, li) => {
              // Check if line is a numbered sentence like "1. ..." or "2. ..." or "[1] ..."
              const isNumberedSentence = /^[1-5]\.\s+/.test(line.trim());
              return (
                <React.Fragment key={li}>
                  {li > 0 && <br />}
                  {isNumberedSentence ? (
                    <span className="block my-1.5 pl-2 border-l-2 border-slate-300 font-normal text-stone-800">
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
};
