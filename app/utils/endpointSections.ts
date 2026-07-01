/**
 * Canonical section order for endpoint pages.
 * 'blocks' is the free intro-block slot — treated like any other section so
 * it can be reordered in the editor and the page reflects the same order.
 */
export const ENDPOINT_DEFAULT_ORDER = [
  'description',
  'auth',
  'endpoint',
  'params-heading',
  'path-params',
  'query-params',
  'headers',
  'body-params',
  'request-example-heading',
  'request-example',
  'response-heading',
  'response-schema',
  'responses',
  'errors-heading',
  'errors',
] as const

export type EndpointSectionKey = (typeof ENDPOINT_DEFAULT_ORDER)[number]
