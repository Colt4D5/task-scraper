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

tip: for easy access you can alias in your .rc file to start the server up with a command

tech: Node.JS, Puppeteer