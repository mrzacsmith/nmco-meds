import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { DomainProvider } from "./context/DomainContext";

import "./tailwind.css";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }) {
  const url = new URL(request.url);
  const host = url.hostname;

  // Check for environment variable first (for npm scripts)
  if (process.env.DOMAIN === '303meds' || process.env.DOMAIN === '505meds') {
    return json({ domain: process.env.DOMAIN });
  }

  // Determine domain based on hostname
  let domain = '505meds';
  if (host.includes('303meds')) {
    domain = '303meds';
  }

  // For local development, allow query param to override
  const domainParam = url.searchParams.get('domain');
  if (domainParam === '303meds' || domainParam === '505meds') {
    domain = domainParam;
  }

  return json({ domain });
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { domain } = useLoaderData();

  return (
    <DomainProvider domain={domain}>
      <Outlet />
    </DomainProvider>
  );
} 