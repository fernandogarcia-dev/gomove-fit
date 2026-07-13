import { renderToString } from "react-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import App from "./App";

export { PRERENDER_ROUTES } from "@/lib/prerender-routes";

type RenderResult = {
  appHtml: string;
  headHtml: string;
};

export function render(url: string): RenderResult {
  const helmetContext = {} as { helmet: HelmetServerState };

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <App url={url} />
    </HelmetProvider>,
  );

  const { helmet } = helmetContext;

  const headHtml = [
    helmet.title.toString(),
    helmet.meta.toString(),
    helmet.link.toString(),
    helmet.script.toString(),
  ].join("\n    ");

  return { appHtml, headHtml };
}
