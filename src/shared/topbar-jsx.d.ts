import type { DetailedHTMLProps, HTMLAttributes } from "react";

/* React 19 does not yet know about <site-topbar>, which is defined as a
   custom element in ./topbar.ts so the framework-free /projects entry can
   use the same bar as the React sites. */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "site-topbar": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        active?: string;
        search?: boolean;
        compact?: boolean;
      };
    }
  }
}

export {};
