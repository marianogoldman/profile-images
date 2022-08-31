const puppeteer = require("puppeteer");

const getOptions = async () => {
  return {
    args: ['--no-sandbox'],
    headless: true,
  }
}

export async function createBrowserComponent() {
  const options = await getOptions()
  return await puppeteer.launch(options)
}
