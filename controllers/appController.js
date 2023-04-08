const { scrape } = require('../models/utils')

exports.getTasks = async (req, res) => {
  const username = req.query.un + '.com'
  const password = req.query.pw
  const name = req.query.name
  if (!username || !password) {
    res.send('You have to include a username and password... ')
  }
  let html
  try {
    const data = await scrape('https://app7.workamajig.com/platinum/', name, username, password)
    html = data
    res.send(html)
  } catch (err) {
    console.log(err)
    res.send('Oops, something went wrong...<br>')
  }
}
