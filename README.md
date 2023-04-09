# Scrape your Workamajig tasks

## Instructions:
- clone this repo and run with `npm start` (or `pnpm start`)
navigate to: 
    
    http:localhost:3333?un={your wam username or email (-`.com`)}&pw={wam password}&name={whatever you'd like it to call you}

  - when inputting your email address, do not include the `.com` in the email (because it sometimes breaks the link)
  - the `name` parameter is optional, but a nice touch, if you ask me ;)
- Once it's running you can either press the browser refresh, cmd + r, or just press the refresh button to reload the latest tasks

If you have trouble with port conflicts just add a .env with a `PORT` environment variable equal to whatever port you want to use:

    PORT=1234

## Chromedriver
A chromedriver is needed to run the headless browser, which can be downloaded from the following link: [https://chromedriver.chromium.org/downloads](https://chromedriver.chromium.org/downloads)

This chromedriver, when downloaded and unzipped, must be placed somewhere where you $PATH environment variable can find it. The natural place is `/usr/bin/`.

tip: for easy access you can alias in your .rc file to start the server up with a command. For example:

    alias tasks=cd /Users/{username}/path/to/scraper && npm start

tech: Node.JS, Puppeteer