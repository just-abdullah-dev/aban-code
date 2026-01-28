/**
 * Accumulate tokens from a stream into a complete response
 */
export async function accumulateStream(
  stream: AsyncGenerator<string, void, unknown>
): Promise<string> {
  let accumulated = '';

  for await (const token of stream) {
    accumulated += token;
  }

  return accumulated;
}

/**
 * Process a stream with a callback for each token
 */
export async function processStream(
  stream: AsyncGenerator<string, void, unknown>,
  onToken: (token: string) => void
): Promise<string> {
  let accumulated = '';

  for await (const token of stream) {
    accumulated += token;
    onToken(token);
  }

  return accumulated;
}

/**
 * Detect if a stream has completed based on response content
 */
export function isStreamComplete(content: string): boolean {
  // Check for common completion markers
  const completionMarkers = [
    /\[DONE\]/i,
    /\<\/response\>/i,
  ];

  return completionMarkers.some(marker => marker.test(content));
}

/**
 * Split stream content into sentences for progressive display
 */
export function* splitIntoSentences(text: string): Generator<string, void, unknown> {
  const sentenceEndings = /([.!?]+[\s\n]+|[\n]{2,})/g;
  const sentences = text.split(sentenceEndings);

  let current = '';

  for (const part of sentences) {
    current += part;

    if (sentenceEndings.test(part)) {
      yield current.trim();
      current = '';
    }
  }

  if (current.trim()) {
    yield current.trim();
  }
}
