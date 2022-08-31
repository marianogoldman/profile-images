const puppeteer = require("puppeteer");

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

export async function createBrowserComponent() {
  // const options = await getOptions()
  return await puppeteer.launch()
}
