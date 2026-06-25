import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

/**
 * Shell HTML usado só no **web** (react-native-web). Carrega a fonte Inter
 * (variável) do Google Fonts e a aplica globalmente, e pinta o fundo do
 * documento com a cor do app para não "piscar" branco no carregamento/overscroll.
 * No nativo a Inter é carregada via expo-google-fonts no _layout.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Fonte de marca para títulos (servida de /public/fonts). */}
        <link
          rel="preload"
          href="/fonts/BlandyGrotesque.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalCss = `
@font-face {
  font-family: 'Blandy Grotesque';
  src: url('/fonts/BlandyGrotesque.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
html, body, #root {
  font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
body { background-color: #f4f8f7; }
`;
