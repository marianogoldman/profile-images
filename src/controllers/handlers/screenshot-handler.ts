import { HandlerContextWithPath, Network, Type } from "../../types"
import { IHttpServerComponent } from "@well-known-components/interfaces"
import { generateScreenshots } from "../../logic/generate-screenshot"
import * as Buffer from "buffer"
import * as fs from "fs"
import IResponse = IHttpServerComponent.IResponse

export function createScreenshotHandler(network: Network, type: Type) {
  return async (
    context: Pick<
      HandlerContextWithPath<"metrics" | "config" | "fetch" | "browser" | "logs", "/api/mainnet/face/:address/:hash">,
      "url" | "components" | "params"
    >
  ): Promise<IResponse> => {
    const { url, components: { metrics}, params: { address, hash} } = context

    if (!address) {
      return {
        status: 400,
        body: { error: "Invalid address" },
      }
    }

    if (!hash) {
      return {
        status: 400,
        body: { error: "Invalid hash" },
      }
    }

    // TODO remove this metric, perhaps change it for timer
    metrics.increment("screenshot_handler", {
      pathname: url.pathname,
    })

    const screenshot = await generateScreenshots(context.components, network, address)

    // @ts-ignore
    writeFileSync("mariano-body.png", screenshot.body)
    writeFileSync("mariano-face.png", screenshot.face)
    // end of 2nd shot

    return {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=2592000, s-maxage=2592000", // 30 days of cache
      },
      body: screenshot.body,
    }
  }
}

const writeFileSync = function (path: string, buffer: Buffer.Buffer) {
  const fileDescriptor = fs.openSync(path, "w")
  if (fileDescriptor) {
    fs.writeSync(fileDescriptor, buffer, 0, buffer.length, 0)
    fs.closeSync(fileDescriptor)
  }
}
