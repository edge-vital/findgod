import Script from "next/script";
import { getEnabledPixels } from "@/lib/pixels";

/**
 * Server component rendered once in the root layout. Reads the currently-
 * enabled tracking pixels from Supabase (cached) and injects the standard
 * snippet for each provider. Renders NOTHING when no pixels are configured
 * — identical behaviour to a findgod.com with tracking disabled.
 *
 * Uses next/script with strategy="afterInteractive" so the pixels load
 * after the page is interactive — doesn't block first paint, but runs
 * quickly enough that a real visitor reliably fires a PageView.
 *
 * Event model for V1:
 *   - PageView fires on every page load (the vendor snippets auto-fire
 *     it on initialisation).
 *   - No custom events yet. Wire signup/chat events in a later pass if
 *     we want to report them to Meta/GA/TikTok as well.
 */
export async function Pixels() {
  const pixels = await getEnabledPixels();
  if (pixels.length === 0) return null;

  return (
    <>
      {pixels.map((p) => {
        if (p.provider === "meta") return <MetaPixel key="meta" id={p.pixelId} />;
        if (p.provider === "ga4") return <GA4Pixel key="ga4" id={p.pixelId} />;
        if (p.provider === "tiktok") return <TikTokPixel key="tiktok" id={p.pixelId} />;
        return null;
      })}
    </>
  );
}

/* ─── Meta Pixel (Facebook/Instagram) ─────────────────────────── */
function MetaPixel({ id }: { id: string }) {
  return (
    <>
      <Script id="findgod-meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${id}');
        fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}

/* ─── Google Analytics 4 ──────────────────────────────────────── */
function GA4Pixel({ id }: { id: string }) {
  return (
    <>
      <Script
        id="findgod-ga4-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script id="findgod-ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${id}');`}
      </Script>
    </>
  );
}

/* ─── TikTok Pixel ─────────────────────────────────────────────── */
function TikTokPixel({ id }: { id: string }) {
  return (
    <Script id="findgod-tiktok-pixel" strategy="afterInteractive">
      {`!function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
        ttq.load('${id}');
        ttq.page();
      }(window, document, 'ttq');`}
    </Script>
  );
}
