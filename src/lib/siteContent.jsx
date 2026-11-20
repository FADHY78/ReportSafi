import { useEffect, useState } from 'react';
import { getSiteContent } from './api';
import { DEFAULT_SITE_CONTENT, withDefaults } from './content';
import { SiteContentContext } from './useSiteContent';

/** Loads editable site copy once from Supabase and shares it with every page. */
export default function SiteContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    let alive = true;
    getSiteContent()
      .then((stored) => {
        if (alive && stored) setContent(withDefaults(stored));
      })
      .catch(() => {
        /* defaults already provide a complete, usable site */
      });
    return () => {
      alive = false;
    };
  }, []);

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}
