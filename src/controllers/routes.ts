import { Router } from "@well-known-components/http-server"
import { GlobalContext, Network, Type } from "../types"
import { createRedirectHandler } from "./handlers/redirect-handler";
import { createScreenshotHandler } from "./handlers/screenshot-handler";
import { staticFileHandler } from "./handlers/static-file-handler";

// We return the entire router because it will be easier to test than a whole server
export async function setupRouter(globalContext: GlobalContext): Promise<Router<GlobalContext>> {
  const router = new Router<GlobalContext>()

  router.get("/api/mainnet/face/:address", createRedirectHandler(Network.MAINNET, Type.FACE))
  router.get("/api/mainnet/body/:address", createRedirectHandler(Network.MAINNET, Type.BODY))
  router.get("/api/goerli/face/:address", createRedirectHandler(Network.GOERLI, Type.FACE))
  router.get("/api/goerli/body/:address", createRedirectHandler(Network.GOERLI, Type.BODY))

  router.get("/api/mainnet/face/:address/:hash", createScreenshotHandler(Network.MAINNET, Type.FACE))
  router.get("/api/mainnet/body/:address/:hash", createScreenshotHandler(Network.MAINNET, Type.BODY))
  router.get("/api/goerli/face/:address/:hash", createScreenshotHandler(Network.GOERLI, Type.FACE))
  router.get("/api/goerli/body/:address/:hash", createScreenshotHandler(Network.GOERLI, Type.BODY))

  // Couldn't find another way to do wildcard matching for /*
  router.get("/:file", staticFileHandler)
  router.get("/:folder/:file", staticFileHandler)
  router.get("/:folder/:subfolder/:file", staticFileHandler)
  return router
}
