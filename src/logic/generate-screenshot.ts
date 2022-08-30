import {Network, Type} from "../types";

const puppeteer = require('puppeteer-core')

/**
 * In order to have the function working in both windows and macOS
 * we need to specify the respective path of the chrome executable for
 * both cases.
 */
const getExePath = (platform: string) => {
  switch (platform) {
    case 'win32':
      return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    case 'linux':
      return '/usr/bin/chromium-browser'
    default:
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
}

const getOptions = async () => {
  return {
    args: ['--no-sandbox'],
    executablePath: getExePath(process.platform),
    headless: true,
  }
}

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

export const generateScreenshot = async (network: Network, type: Type, address: string) => {
  const fetchUrl = getUrl(network, type, address)
  const viewport = getViewPort(type)
  const clip = getClip(type)

  return await getScreenshot(fetchUrl, viewport, clip)
}

export const getScreenshot = async (url: string, viewport: ViewPort, clip?: Clip) => {
  const timer = createTimer()

  const options = await getOptions()
  const browser = await puppeteer.launch(options)
  try {
    const page = await browser.newPage()
    await page.setViewport({
      deviceScaleFactor: 2,
      ...viewport,
    })
    timer.openBrowser()

    await page.goto(url)
    timer.goToUrl()

    const container = await page.waitForSelector('.is-loaded')
    timer.waitForReady()

    const buffer = await container.screenshot({
      encoding: 'binary',
      clip,
    })
    timer.takeScreenshot()

    console.log(timer.timings())
    return buffer
  } finally {
    await browser.close()
  }
}

const getUrl = (network: Network, type: Type, address: string): string => {
  const url = new URL("https://wearable-preview.decentraland.org")
  url.searchParams.append('profile', address)
  url.searchParams.append('transparentBackground', '')
  url.searchParams.append('autoRotateSpeed', '0')

  if (type === Type.FACE) {
    url.searchParams.append('zoom', '70')
    url.searchParams.append('offsetY', '1.3')
    url.searchParams.append('centerBoundingBox', 'false')
  }

  if (network === Network.GOERLI) {
    url.searchParams.append('env', 'dev')
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
  openBrowser: number;
  goToUrl: number;
  waitForReady: number;
  takeScreenshot: number;
  total: number;
}

type Timer = {
  openBrowser: () => void
  goToUrl: () => void
  waitForReady: () => void
  takeScreenshot: () => void
  timings: () => Timings
}

const createTimer = (): Timer => {
  const startMs = (new Date()).getTime()
  let openBrowserMs = 0
  let goToUrlMs = 0
  let waitForReadyMs = 0
  let takeScreenshotMs = 0

  const openBrowser = () => {
    openBrowserMs = (new Date()).getTime()
  }

  const goToUrl = () => {
    goToUrlMs = (new Date()).getTime()
  }

  const waitForReady = () => {
    waitForReadyMs = (new Date()).getTime()
  }

  const takeScreenshot = () => {
    takeScreenshotMs = (new Date()).getTime()
  }

  const timings = () => {
    return {
      openBrowser: openBrowserMs - startMs,
      goToUrl: goToUrlMs - openBrowserMs,
      waitForReady: waitForReadyMs - openBrowserMs,
      takeScreenshot: takeScreenshotMs - waitForReadyMs,
      total: takeScreenshotMs - startMs
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
