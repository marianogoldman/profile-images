import {HandlerContextWithPath} from "../../types";
import {IHttpServerComponent} from "@well-known-components/interfaces";
import * as fs from "fs";
import * as path from "path";
import IResponse = IHttpServerComponent.IResponse;

export async function staticFileHandler(context: Pick<HandlerContextWithPath<"metrics" | "config" | "fetch", "/:file">, "url" | "components" | "params">): Promise<IResponse> {
  const { url } = context
  const thePath = path.join('node_modules/@dcl/wearable-preview/static-local', url.pathname);

  if (!fs.existsSync(thePath)) {
    return {
      status: 404,
      body: `Not found`
    }
  }

  return {
    status: 200,
    body: fs.readFileSync(thePath)
  }
}
