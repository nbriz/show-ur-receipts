/* global QRCode, FileUploader, autosize, Base64 */

const qrcode = new QRCode(document.querySelector('.qrcode'), 'No source URL has been set.')

window.uploader = new FileUploader({
  types: ['application/json'],
  click: '#upload',
  ready: upload,
  error: (err) => window.alert(err)
})

function displayShowMe () {
  document.querySelector('#show-me').style.display = 'flex'
  document.querySelector('#show-me button').addEventListener('click', () => {
    document.querySelector('#show-me').style.display = 'none'
  })
}

function setup () {
  const textareas = document.querySelectorAll('textarea')
  document.querySelector('.date').value = String(new Date())
  const newReceipt = () => textareas.forEach(t => { t.value = '' })
  const data = decodeURL()
  if (data === 'show-me') {
    newReceipt()
    displayShowMe()
  } else if (data) {
    putData(data)
    autosize(textareas)
  } else {
    newReceipt()
  }
}

function addSource () {
  const source = document.querySelector('.source')
  const title = window.prompt('what\'s the URL for your source?')
  const url = window.prompt('link or it didn\'t happen.')
  if (url && url.indexOf('http') === 0) {
    source.setAttribute('href', url)
    source.textContent = title
    document.querySelector('#source').style.borderBottom = 'none'
    updateQRCode(url)
  } else {
    window.alert('that\'s not a URL, it\'s gotta start with http')
  }
  if (source.textContent === 'UNPUBLISHED') source.style.opacity = 0.5
  else source.style.opacity = 1
}

function showSubTitles (name) {
  const ta = document.querySelector(`.${name}`)
  const h2 = document.querySelector(`[name="${name}"]`)
  if (ta.value === '') h2.textContent = ''
  else h2.textContent = ta.getAttribute('placeholder')
}

function updateQRCode (url) {
  qrcode.clear()
  qrcode.makeCode(url)
  qrcode._el.querySelector('img').style.opacity = 1
}

function getData () {
  const url = document.querySelector('.source').getAttribute('href')
  const source = document.querySelector('.source').textContent
  const data = { url, source }
  const d = ['date', 'claim', 'tags', 'title', 'author', 'tldr', 'reasons', 'verified']
  d.forEach(i => { data[i] = document.querySelector(`.${i}`).value })
  if (data.tags.includes(',')) data.tags = data.tags.split(',').map(t => t.trim())
  else data.tags = data.tags.split(' ')
  return data
}

function putData (data) {
  if (data.url) {
    const source = document.querySelector('.source')
    source.setAttribute('href', data.url)
    source.style.opacity = 1
  }
  if (data.source) document.querySelector('.source').textContent = data.source
  const d = ['date', 'claim', 'tags', 'title', 'author', 'source', 'tldr', 'reasons', 'verified']
  d.forEach(i => { if (data[i]) document.querySelector(`.${i}`).value = data[i] })
  if (data.url) updateQRCode(data.url)
  if (data.source) document.querySelector('.source').textContent = data.source
  if (data.tldr) showSubTitles('tldr')
  if (data.reasons) showSubTitles('reasons')
  if (data.verified) showSubTitles('verified')
}

function download () {
  const text = JSON.stringify(getData(), null, 2)
  // const b64 = window.btoa(text)
  const b64 = Base64.encode(text)
  const uri = `data:application/json;base64,${b64}`
  const a = document.createElement('a')
  const name = document.querySelector('.claim').value.replace(/ /g, '_')
  a.setAttribute('download', `${name}.json`)
  a.setAttribute('href', uri)
  a.click()
  a.remove()
  toggleMenu()
}

function upload (file) {
  const b64 = file.data.split('base64,')[1]
  // const text = window.atob(b64)
  const text = Base64.decode(b64)
  const data = JSON.parse(text)
  putData(data)
  autosize(document.querySelectorAll('textarea'))
  toggleMenu()
}

function encodeURL () {
  const text = JSON.stringify(getData())
  // const b64 = window.btoa(text)
  const b64 = Base64.encode(text)
  const uri = encodeURIComponent(b64)
  window.location.hash = `#data,${uri}`
  window.alert('The URL in your address bar has been updated to include your data. Copy+Paste to share it. URL too long? try https://is.gd to shorten it.')
  toggleMenu()
}

function decodeURL () {
  if (window.location.hash === '#show-me') {
    return 'show-me'
  } else if (window.location.hash) {
    const uri = window.location.hash.split('#data,')[1]
    const b64 = decodeURIComponent(uri)
    // const text = window.atob(b64)
    const text = Base64.decode(b64)
    const data = JSON.parse(text)
    return data
  }
}

function toggleMenu () {
  const nav = document.querySelector('nav')
  const open = nav.style.display === 'flex'
  if (open) nav.style.display = 'none'
  else nav.style.display = 'flex'
}

let showInfoTimer
const info = document.querySelector('#info')
const infoTxt = document.querySelector('#info > span:nth-child(2)')

function delayShowInfo (e) {
  if (showInfoTimer) clearTimeout(showInfoTimer)
  showInfoTimer = setTimeout(() => showInfo(e), 500)
}

function showInfo (e) {
  if (showInfoTimer) clearTimeout(showInfoTimer)
  let text = e.target.dataset.info
  if (!text) text = e.target.parentNode.dataset.info
  infoTxt.textContent = text
  info.style.display = 'block'
}

function hideInfo () {
  info.style.display = 'none'
}

const infoz = document.querySelectorAll('[data-info]')
infoz.forEach(ele => {
  ele.addEventListener('mouseover', delayShowInfo)
  ele.addEventListener('mouseout', hideInfo)
  ele.addEventListener('focus', showInfo)
  ele.addEventListener('input', hideInfo)
})

window.addEventListener('load', setup)
document.querySelector('#source').addEventListener('click', addSource)
document.querySelector('#download').addEventListener('click', download)
document.querySelector('#share').addEventListener('click', encodeURL)
document.querySelector('#close-menu').addEventListener('click', toggleMenu)
document.querySelector('.hamburger').addEventListener('click', toggleMenu)

document.querySelector('.source').addEventListener('click', (e) => {
  if (!e.target.getAttribute('href')) {
    window.alert('Click on "source" to add your source\'s name and URL')
  }
})

document.querySelectorAll('textarea').forEach((ta) => {
  ta.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\n/g, '')
    autosize(e.target)
  })
})

const verified = ['tldr', 'reasons', 'verified']
verified.forEach((c) => {
  const ta = document.querySelector(`.${c}`)
  ta.addEventListener('input', e => showSubTitles(e.target.className))
})
