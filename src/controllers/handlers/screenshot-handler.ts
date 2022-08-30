import {HandlerContextWithPath, Network, Type} from "../../types";
import {IHttpServerComponent} from "@well-known-components/interfaces";
import {generateScreenshot} from "../../logic/generate-screenshot";
import IResponse = IHttpServerComponent.IResponse;

export function createScreenshotHandler(network: Network, type: Type) {
  return async (context: Pick<HandlerContextWithPath<"metrics" | "fetch", "/mainnet/face/:address/:hash">, "url" | "components" | "params">): Promise<IResponse> => {
    const {address, hash} = context.params
    if (!address) {
      return {
        status: 400,
        body: {error: 'Invalid address'}
      }
    }

    if (!hash) {
      return {
        status: 400,
        body: {error: 'Invalid hash'}
      }
    }

    const {
      url,
      components: {metrics},
    } = context

    metrics.increment("screenshot_handler", {
      pathname: url.pathname,
    })

    // try {
      const screenshot = await generateScreenshot(network, type, address)

      return {
        status: 200,
        headers: {
          "content-type": 'image/png',
          "cache-control": 'public, max-age=2592000, s-maxage=2592000' // 30 days of cache
        },
        body: screenshot
      }
  //   } catch (error: any) {
  //     console.log(error)
  //     return {
  //       status: 500,
  //       body: {error: error.message ?? error}
  //     }
  //   }
  }
}
