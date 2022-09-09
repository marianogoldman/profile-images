import { AppComponents, Network, Type } from "../types"
import { Page } from "puppeteer"
import { IConfigComponent } from "@well-known-components/interfaces"
import * as Buffer from "buffer"
import { getPeer } from "./utils";

export type ViewPort = {
  width: number
  height: number
}

export type Clip = {
  x: number
  y: number
  width: number
  height: number
}

export const generateScreenshots = async (
  components: Pick<AppComponents, "browser" | "config" | "logs">,
  network: Network,
  address: string
): Promise<Screenshots> => {
  const page = await components.browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36"
  )

  // // attach cdp session to page
  // const client = await page.target().createCDPSession();
  // await client.send('Debugger.enable');
  // await client.send('Debugger.setAsyncCallStackDepth', {maxDepth: 32});
  //
  // function limit(string = '', limit = 0) {
  //   return string.substring(0, limit)
  // }
  //
  // // enable network
  // await client.send('Network.enable');
  // // attach callback to network response event
  // await client.on('Network.responseReceived', (params) => {
  //   const {type, response: {url, status, fromDiskCache}} = params;
  //   /*
  //    * See: https://chromedevtools.github.io/devtools-protocol
  //    * /tot/Network/#type-ResourceTiming for complete list of
  //    * timing data available under 'timing'
  //    */
  //   console.log({
  //     type, url: limit(url, 100), status, fromDiskCache
  //   })
  // });

  const url = await getUrl(components.config, network, Type.BODY, address)
  await page.goto(url)
  try {
    const body = await capture(components, page, network, Type.BODY)

    await page.evaluate(() =>
      window.postMessage({
        type: "update",
        payload: {
          options: {
            profile: new URLSearchParams(window.location.search).get("profile"),
            zoom: (70 * 1.8) / 100 + 1, // zoom factor: 70
            offsetY: 1.3,
            disableBackground: true,
            disableAutoRotate: true, // autoRotateSpeed esta deprecado, ahora es asi
            disableAutoCenter: true, // centerBoundingBox esta deprecado, ahora es asi
            disableFadeEffect: true,
            peerUrl: new URLSearchParams(window.location.search).get("peerUrl"),
          },
        },
      })
    )

    const face = await capture(components, page, network, Type.FACE)

    return {
      body,
      face,
    }
  } catch (_) {
    components.logs.getLogger('generate-screenshots').error(await page.content())
    throw _
  } finally {
    await page.close()
  }
}

async function capture(components: Pick<AppComponents, "logs">, page: Page, network: Network, type: Type): Promise<Buffer.Buffer> {
  const viewport = getViewPort(type)
  const clip = getClip(type)

  const timer = createTimer(type)
  await page.setViewport({
    deviceScaleFactor: 2,
    ...viewport,
  })
  timer.goToUrl()

  const container = await page.waitForSelector(".is-loaded", { timeout: 30_000 })
  timer.waitForReady()

  if (!container) {
    throw new Error("Timeout waiting for profile to render.")
  }

  const buffer = await container.screenshot({
    encoding: "binary",
    clip,
  })
  timer.takeScreenshot()

  // let performance = JSON.parse(await page.evaluate(() => JSON.stringify(performance.getEntries(), undefined, 2)));
  // console.log(performance.map((p: any) => ({ type: p.entryType, name: p.name, duration: p.duration })))
  console.log(timer.timings())
  components.logs.getLogger('generate-screenshots').info("timings", timer.timings())

  // @ts-ignore
  return buffer
}

const getUrl = async (config: IConfigComponent, network: Network, type: Type, address: string): Promise<string> => {
  const baseUrl = (await config.getString("WEARABLES_PREVIEW_URL")) || "https://wearable-preview.decentraland.org"
  const peer = await getPeer(config, network)

  const url = new URL(baseUrl)
  url.searchParams.append("profile", address)
  url.searchParams.append("disableBackground", "true")
  url.searchParams.append("disableAutoRotate", "true")
  url.searchParams.append("disableFadeEffect", "true")
  url.searchParams.append("peerUrl", peer)

  if (type === Type.FACE) {
    url.searchParams.append("zoom", "70")
    url.searchParams.append("offsetY", "1.3")
    url.searchParams.append("disableAutoCenter", "true")
  }

  if (network === Network.GOERLI) {
    url.searchParams.append("env", "dev")
  }

  return url.toString()
}

const getViewPort = (type: Type): ViewPort => ({
  width: 512,
  height: 1024 + (type === Type.FACE ? 512 : 0),
})

const getClip = (type: Type): Clip | undefined => {
  if (type === Type.FACE) {
    return {
      x: 0,
      y: 0,
      width: 512,
      height: 512,
    }
  }
  return undefined
}

type Timings = {
  goToUrl: number
  waitForReady: number
  takeScreenshot: number
  total: number
}

type Timer = {
  goToUrl: () => void
  waitForReady: () => void
  takeScreenshot: () => void
  timings: () => Timings
}

export type Screenshots = {
  body: Buffer.Buffer
  face: Buffer.Buffer
}

const createTimer = (name: string): Timer => {
  const startMs = new Date().getTime()
  let goToUrlMs = 0
  let waitForReadyMs = 0
  let takeScreenshotMs = 0

  const goToUrl = () => {
    goToUrlMs = new Date().getTime()
  }

  const waitForReady = () => {
    waitForReadyMs = new Date().getTime()
  }

  const takeScreenshot = () => {
    takeScreenshotMs = new Date().getTime()
  }

  const timings = () => {
    return {
      name: name,
      goToUrl: goToUrlMs - startMs,
      waitForReady: waitForReadyMs - goToUrlMs,
      takeScreenshot: takeScreenshotMs - waitForReadyMs,
      total: takeScreenshotMs - startMs,
    }
  }

  return {
    goToUrl,
    waitForReady,
    takeScreenshot,
    timings,
  }
}
