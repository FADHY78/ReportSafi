import { createContext, useContext } from 'react';
import { DEFAULT_SITE_CONTENT } from './content';

export const SiteContentContext = createContext(DEFAULT_SITE_CONTENT);

export function useSiteContent() {
  return useContext(SiteContentContext);
}
