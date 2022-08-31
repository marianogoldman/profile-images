import {HandlerContextWithPath} from "../../types";
import {IHttpServerComponent} from "@well-known-components/interfaces";
import * as fs from "fs";
import IResponse = IHttpServerComponent.IResponse;

export async function staticFileHandler(context: Pick<HandlerContextWithPath<"metrics" | "config" | "fetch", "/preview">, "url" | "components" | "params">): Promise<IResponse> {
  const { url } = context

  function extractFile(path: string, pathPrefix: string ) {
    return path.substring(path.indexOf(pathPrefix) + pathPrefix.length)
  }

  const index = extractFile(url.pathname,'preview/')

  if (!fs.existsSync(`node_modules/@dcl/wearable-preview/${index}`)) {
    return {
      status: 404,
      body: `Not found`
    }
  }

  return {
    status: 200,
    body: fs.readFileSync(`node_modules/@dcl/wearable-preview/${index}`)
  }
}
