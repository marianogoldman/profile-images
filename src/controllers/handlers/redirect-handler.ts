import { HandlerContextWithPath, Network, Type } from "../../types";
import { generateRedirect } from "../../logic/generate-redirect";
import { IHttpServerComponent } from "@well-known-components/interfaces";
import IResponse = IHttpServerComponent.IResponse;

export function createRedirectHandler(network: Network, type: Type) {
  return async (context: Pick<HandlerContextWithPath<"metrics" | "config" | "fetch", "/mainnet/face/:address">, "url" | "components" | "params">): Promise<IResponse> => {
    const { address } = context.params
    if (!address) {
      return {
        status: 400,
        body: { error: 'Invalid address' }
      }
    }

    const {
      url,
      components: {metrics},
    } = context

    metrics.increment("redirect_handler", {
      pathname: url.pathname,
    })

    try {
      return {
        status: 302,
        headers: {
          Location: await generateRedirect(context.components, network, type, address)
        },
        body: ''
      }
    } catch (error: any) {
      return {
        status: 500,
        body: { error: error.message ?? error }
      }
    }
  }
}
