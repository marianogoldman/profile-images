import { Router } from "@well-known-components/http-server"
import { GlobalContext, Network, Type } from "../types"
import { createRedirectHandler } from "./handlers/redirect-handler";
import { createScreenshotHandler } from "./handlers/screenshot-handler";
import { staticFileHandler } from "./handlers/static-file-handler";

// We return the entire router because it will be easier to test than a whole server
export async function setupRouter(globalContext: GlobalContext): Promise<Router<GlobalContext>> {
  const router = new Router<GlobalContext>()

  router.get("/mainnet/face/:address", createRedirectHandler(Network.MAINNET, Type.FACE))
  router.get("/mainnet/body/:address", createRedirectHandler(Network.MAINNET, Type.BODY))
  router.get("/goerli/face/:address", createRedirectHandler(Network.GOERLI, Type.FACE))
  router.get("/goerli/body/:address", createRedirectHandler(Network.GOERLI, Type.BODY))

  router.get("/mainnet/face/:address/:hash", createScreenshotHandler(Network.MAINNET, Type.FACE))
  router.get("/mainnet/body/:address/:hash", createScreenshotHandler(Network.MAINNET, Type.BODY))
  router.get("/goerli/face/:address/:hash", createScreenshotHandler(Network.GOERLI, Type.FACE))
  router.get("/goerli/body/:address/:hash", createScreenshotHandler(Network.GOERLI, Type.BODY))

  // Couldn't find another way to do wildcard matching for /preview/*
  router.get("/preview/:file", staticFileHandler)
  router.get("/preview/:folder/:file", staticFileHandler)
  router.get("/preview/:folder/:subfolder/:file", staticFileHandler)
  return router
}
