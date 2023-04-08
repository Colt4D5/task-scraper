const puppeteer = require('puppeteer')

async function scrape(url, name = 'My', username, password) {
  console.log('Launching headless browser...')
  // use the non-headless function if you want to see the magic happen
  // const browser = await puppeteer.launch({headless: false});
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // Set screen size
  await page.setViewport({width: 1920, height: 1024});
  
  // await new Promise(r => setTimeout(r, 7000))

  const [elements] = await Promise.all([
    page.waitForNavigation('[name="UserID"]'),
    page.waitForNavigation('[name="Password"]'),
  ]);
  
  console.log('Logging in...')

  await page.waitForSelector('[name="UserID"]')
  await page.type('[name="UserID"]', username, {delay: 50})

  
  await page.waitForSelector('[name="Password"]')
  await page.type('[name="Password"]', password, {delay: 50})
  
  const [response] = await Promise.all([
    page.waitForNavigation('[data-action="submit:login"]'),
    page.click('[data-action="submit:login"]'),
  ]);

  console.log('Fetching tasks...')

  await page.waitForSelector('listview#lstMyTasks h2')

  const dates = await page.$$('listview#lstMyTasks > li')

  let index = 0
  let taskArr = []

  console.log('Writing tasks...')

  for (date of dates) {
    const title = await page.evaluate(el => el.querySelector('h2').textContent, date)
    taskArr.push({ date: title, tasks: [] })

    let tasks 
    
    tasks = await page.$$(`listview#lstMyTasks > li:nth-child(${index + 1}) > ul > li`)

    // console.log(title)
    for (task of tasks) {
      const taskTitle = await page.evaluate(el => el.querySelector('button[data-action="openProjectDash"]').textContent, task)

      const taskSubtitle = await page.evaluate(el => el.querySelector('.mutedDark.pad-b-s').textContent, task)

      const taskTime = await page.evaluate(el => el.querySelector('.i-time.icon-l.italic.inline-block.pad-t-s.pad-r-l').textContent.split('h')[0], task)

      // const taskDetails = await page.evaluate(el => el.querySelector('.pad-b-s.textflow > span').innerText, task)
      async function getTaskDeets() {
        let taskDetails = 'Nope'
        try {
          taskDetails = await page.evaluate(el => el.querySelector('.pad-b-s.textflow > span.usr').innerHTML, task)
        } catch (err) {
          taskDetails = 'No task details found...'
        }
        return taskDetails
      }
      const taskDetails = await getTaskDeets();
      const taskObj = {
        title: taskTitle,
        subtitle: taskSubtitle,
        time: taskTime,
        details: taskDetails
      }

      taskArr[index].tasks.push(taskObj)
      // console.log(taskTitle)
      
    }
    // console.log(index)
    index++

    console.log(`Found ${tasks.length} tasks for date ${index} of ${dates.length}`)

  }
  // console.log(taskArr)
  console.log('Building html...')
  const html = await buildHTMLDocument(taskArr, name)
  await browser.close();
  console.log('Done!')
  return html
}

async function buildHTMLDocument(arr, name) {
  let taskHTML = ''
  arr.forEach(date => {
    const dateText = `<div class="date-header"><h1>${date.date}</h1></div>`
    let currentDateTasks = ''
    date.tasks.forEach(task => {
      currentDateTasks += `
        <article class="flex-item">
          <div class="details">
            <div class="summary">
              <div class="summary-content">
                <div class="checkbox-cont">
                  <div class="checkbox"></div>
                </div>
                <div class="title-div">
                  <span class="task-title">${task.title}</span>
                  <p class="task-name">${task.subtitle}</p>
                </div>
                <div class="time-div"><p>${task.time}</p></div>
              </div>
              <div class="content">
                <div class="content_inner">
                  ${task.details}
                </div>
              </div>
            </div>
          </div>
        </article>
      `
    })
    taskHTML += `${dateText}<div class="flex">${currentDateTasks}</div>`
  })
  // const boilerplate = '<link rel="stylesheet" href="style.css">' + taskHTML + '<script type="text/javascript" src="./main.js"></script>'
  const boilerplate = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${name}'s Tasks</title>
        <style>
          :root {
            --clr-primary:  #ddd;
            --clr-accent: #fca311;
            --clr-dark: #111;
            --clr-light: #e5e5e5;
            --text-header: #999;
          }
          
          * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
          }
          
          html {
            font-size: 16px;
          }
          
          body {
            background-color: var(--clr-light);
            min-height: 100vh;
            /* box-shadow: inset 0 0 50px rgb(0 0 0 / 0.8); */
            padding-bottom: 6rem;
          }
          
          .flex {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
            padding: 0 3rem;
            flex-wrap: wrap;
            gap: 12px;
            margin: 2rem 0;
          }
          .date-header {
            background-color: var(--clr-primary);
            padding: 1.5rem 3rem;
            box-shadow: -12px -12px 12px rgb(255 255 255 / 0.5),
                        12px 12px 16px rgb(70 70 70 / 0.15),
                        inset 8px 8px 15px rgb(255 255 255 / 0.5),
                        inset -6px -6px 15px rgb(70 70 70 / 0.15);
          }
          
          .date-header > h1 {
            color: var(--text-header);
          }
          
          article.flex-item {
            width: 45%;
            margin: 1rem;
            border-radius: 60px;
            overflow: hidden;
            box-shadow: -15px -15px 20px rgb(255 255 255 / 0.75),
                        10px 10px 15px rgb(70 70 70 / 0.15),
                        inset -8px -8px 12px rgb(255 255 255 / 0.5),
                        inset 8px 8px 12px rgb(70 70 70 / 0.15);
          }
          article.flex-item.wh { display: none; }
          
          .summary {
            box-shadow: 0 6px 6px rgb(0 0 0 / 0.4);
            cursor: pointer;
          }
          
          .summary-content {
            background-color: #ececec;
            padding: 0.5rem 0;  
            display:flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .checkbox-cont {
            width: 125px;
            display: grid;
            place-items: center;
          }
          
          .checkbox {
            width: 30px;
            height: 30px;
            background-color: #dddddd;
            border-radius: 50%;
            box-shadow: -5px -5px 6px rgb(255 255 255 / 0.3),
                        5px 5px 6px rgb(70 70 70 / 0.1),
                        inset -5px -5px 6px rgb(255 255 255 / 0.3),
                        inset 5px 5px 6px rgb(70 70 70 / 0.1);
            transition: background-color 0.3s ease;
          }
          
          .checkbox.active {
            background-color: rgb(52 199 89);  
          }
          
          .title-div {
            width: 100%;
          }
          
          .time-div {
            display:grid;
            place-items:center;
            width: 100px;
            height:70px;
            border-left: 1px solid #ccc;
          }
          
          .time-div > p {
            font-size: 2rem;
            font-weight: 500;
          }
          
          .content {
            max-height: 0px;
            transition: max-height 0.4s ease;
            cursor: auto;
          }
          
          .content_inner {
            background-color: rgb(255 255 255 0.2);
            padding: 2rem;
            font-size: 1.25rem;
            box-shadow: inset -6px -6px 12px rgb(255 255 255 / 0.5),
                        inset 6px 6px 12px rgb(70 70 70 / 0.15);
          
          }
          
          .task-title {
            font-size: 1.5rem;
            font-weight: bold;
          }
          
          .task-name {
            font-size: 1.25rem;
          }
          
          #settings {
            position:  absolute;
            top:  0.5rem;
            right:  0.5rem;
          }
          button#refresh {
            padding:  1.5rem 2.5rem;
            border-radius: 60px;
            overflow: hidden;
            cursor:  pointer;
            box-shadow: -15px -15px 20px rgb(255 255 255 / 0.75),
                        10px 10px 15px rgb(70 70 70 / 0.15),
                        inset -8px -8px 12px rgb(255 255 255 / 0.5),
                        inset 8px 8px 12px rgb(70 70 70 / 0.15);
          }
          #settings label {
            margin-right: 1rem;
          }   
          
          #loader {
            width: 40px;
            height: 40px;
            margin: 4rem auto;
            border-radius: 50%;
            border: 6px solid #fff;
            border-bottom: 6px solid #9caf88;
            animation: load 1s linear infinite;
          }
          @keyframes load {
            0% {
              rotate: 0deg;
            }
            100% {
              rotate: 360deg;
            }
          }
        </style>
      </head>
      <body>
        <div id="task-wrapper">
          <div id="settings">
            <label for="wc">
              <input type="checkbox" name="wc" id="wc" checked /> Show WCs?
            </label>
            <label for="wh">
              <input type="checkbox" name="wh" id="wh" /> Show WHs?
            </label>
            <button id="refresh">Refresh</button>
          </div>
          ${taskHTML}
        </div>
        <script type="text/javascript">
          const tasks = document.querySelectorAll('.summary-content')
          const checkboxes = document.querySelectorAll('.checkbox')
          const contents = document.querySelectorAll('.content')
          const refreshBtn = document.querySelector('#refresh')
          
          checkboxes.forEach(check => {
            check.addEventListener('click', e => {
              const checkbox = e.target.closest('.checkbox')
          
              checkbox.classList.toggle('active')
            })
          })
          
          tasks.forEach(task => {
            task.addEventListener('click', e => {
              if (e.target.closest('.checkbox')) return;
          
              const content = e.target.closest('.summary').lastElementChild
          
              content.classList.toggle('active')
          
              if (content.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px'
              } else content.style.maxHeight = 0 + 'px'
            })
          })
          
          contents.forEach(content => {
            content.addEventListener('click', e => {
              navigator.clipboard.writeText(e.target.innerText)
              // copyToClipboard(e.target.innerText)
            })
          })
          
          function copyToClipboard(text) {
              if (window.clipboardData) { // Internet Explorer
                  window.clipboardData.setData("Text", text);
              } else {
                  unsafeWindow.netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                  const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
                  clipboardHelper.copyString(text);
              }
          }
          
          function refreshTasks() {
            const taskWrapper = document.querySelector('#task-wrapper')
            taskWrapper.innerHTML = '<div id="loader-wrapper"><div id="loader"></div></div>'
            window.location.reload()
          }

          window.onbeforeunload = function(){
            refreshTasks()
          };
          
          refreshBtn.addEventListener('click', refreshTasks)

          function handleHiddenTasks() {
            const items = document.querySelectorAll('.flex-item')

            items.forEach(item => {
              if (item.querySelector('.task-name')?.textContent.includes('WC') && !item.querySelector('.task-name')?.textContent.includes('WH')) {
                  item.classList.add('wc')
              } else {
                  item.classList.add('wh')
              }
            })
          }
          handleHiddenTasks()

          const checkboxInputs = Array.from(document.querySelectorAll('input[type="checkbox"]'))
          checkboxInputs.forEach(box => {
            box.addEventListener('change', handleFilter)
          })

          function handleFilter(e) {
            const value = e.target.name
            if (e.target.checked) {
              document.querySelectorAll('article.flex-item.' + value).forEach(el => el.style.display = 'unset')
            } else {
              document.querySelectorAll('article.flex-item.' + value).forEach(el => el.style.display = 'none')
            }
          }
        
        </script>
      </body>
    </html>
  `
  return boilerplate
}

module.exports = { scrape }