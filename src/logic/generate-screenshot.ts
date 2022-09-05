import { AppComponents, Network, Type } from "../types"
import { Page } from "puppeteer"
import { IConfigComponent } from "@well-known-components/interfaces"
import * as Buffer from "buffer"

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
  components: Pick<AppComponents, "browser" | "config">,
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

  try {
    const body = await capture(page, components.config, network, Type.BODY, address)
    const face = await capture(page, components.config, network, Type.FACE, address)
    return {
      body,
      face,
    }
  } finally {
    await page.close()
  }
}

async function capture(
  page: Page,
  config: IConfigComponent,
  network: Network,
  type: Type,
  address: string
): Promise<Buffer.Buffer> {
  const url = await getUrl(config, network, type, address)
  const viewport = getViewPort(type)
  const clip = getClip(type)

  const timer = createTimer()
  await page.setViewport({
    deviceScaleFactor: 2,
    ...viewport,
  })
  timer.openBrowser()

  await page.goto(url)
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
  // console.log(performance.map((p: any) => ({type: p.entryType, name: p.name, duration: p.duration})))
  console.log(timer.timings())

  // @ts-ignore
  return buffer
}

const getUrl = async (config: IConfigComponent, network: Network, type: Type, address: string): Promise<string> => {
  const baseUrl = (await config.getString("WEARABLES_PREVIEW_URL")) || "https://wearable-preview.decentraland.org"
  const url = new URL(baseUrl)
  url.searchParams.append("profile", address)
  url.searchParams.append("disableBackground", "")
  url.searchParams.append("autoRotateSpeed", "0")

  if (type === Type.FACE) {
    url.searchParams.append("zoom", "70")
    url.searchParams.append("offsetY", "1.3")
    url.searchParams.append("centerBoundingBox", "false")
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
  openBrowser: number
  goToUrl: number
  waitForReady: number
  takeScreenshot: number
  total: number
}

type Timer = {
  openBrowser: () => void
  goToUrl: () => void
  waitForReady: () => void
  takeScreenshot: () => void
  timings: () => Timings
}

export type Screenshots = {
  body: Buffer.Buffer
  face: Buffer.Buffer
}

const createTimer = (): Timer => {
  const startMs = new Date().getTime()
  let openBrowserMs = 0
  let goToUrlMs = 0
  let waitForReadyMs = 0
  let takeScreenshotMs = 0

  const openBrowser = () => {
    openBrowserMs = new Date().getTime()
  }

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
      openBrowser: openBrowserMs - startMs,
      goToUrl: goToUrlMs - openBrowserMs,
      waitForReady: waitForReadyMs - openBrowserMs,
      takeScreenshot: takeScreenshotMs - waitForReadyMs,
      total: takeScreenshotMs - startMs,
    }
  }

  return {
    openBrowser,
    goToUrl,
    waitForReady,
    takeScreenshot,
    timings,
  }
}
