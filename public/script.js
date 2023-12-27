// let memos = [{ content: '網上連儂牆' }, { content: '香港加油' }]

let memoTemplate = cardList.querySelector('.card')
let imageTemplate = memoTemplate.querySelector('.image-list .image')

cardListMessage.textContent = 'No memo at the moment. Post your first memo now!'

cardList.textContent = ''

for (let memo of memos) {
  showMemo(memo)
}

function showMemo(memo) {
  cardListMessage.hidden = true

  let node = memoTemplate.cloneNode(true)

  node.querySelector('.memo-content').textContent = memo.content

  let imageList = node.querySelector('.image-list')
  imageList.textContent = ''
  for (let image of memo.images) {
    let node = imageTemplate.cloneNode(true)
    let img = node.querySelector('img')
    img.src = image
    imageList.appendChild(node)
  }

  node.querySelector('.remove-button').addEventListener('click', () => {
    removeMemo(memo, node)
  })

  cardList.appendChild(node)
}

async function removeMemo(memo, node) {
  let res = await fetch('/memos/' + memo.id, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })
  let json = await res.json()
  if (json.error) {
    alert(json.error)
    return
  }
  node.remove()
  if (cardList.children.length == 0) {
    cardListMessage.hidden = false
  }
}

async function submitMemo(event) {
  console.log('submit memo with ajax...')
  event.preventDefault()
  let form = event.target
  let submitMessage = form.querySelector('.message')
  let res = await fetch(form.action, {
    method: form.method,
    headers: {
      Accept: 'application/json',
    },
    body: new FormData(form),
  })
  // console.log('res:', res)
  let json = await res.json()
  if (json.error) {
    submitMessage.textContent = json.error
    return
  }
  submitMessage.textContent = 'Submitted successfully'
  let content = form.content.value
  form.reset()
  showMemo({
    id: json.id,
    content,
    images: json.images,
  })
}

async function submitLogin(event) {
  console.log('submit login with ajax...')
  event.preventDefault()
  let form = event.target
  let submitMessage = form.querySelector('.message')
  let res = await fetch(form.action, {
    method: form.method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      username: form.username.value,
      password: form.password.value,
    }),
  })
  // console.log('res:', res)
  let json = await res.json()
  if (json.error) {
    submitMessage.textContent = json.error
    return
  }
  submitMessage.textContent = 'Login successfully'
  loadRole()
}

async function submitLogout(event) {
  console.log('submit logout with ajax...')
  event.preventDefault()
  let form = event.target
  let submitMessage = form.querySelector('.message')
  let res = await fetch(form.action, {
    method: form.method,
    headers: {
      Accept: 'application/json',
    },
  })
  let json = await res.json()
  if (json.error) {
    submitMessage.textContent = json.error
    return
  }
  submitMessage.textContent = 'Logout successfully'
  loadRole()
}

async function loadRole() {
  let res = await fetch('/role')
  let json = await res.json()
  loginForm.hidden = json.role != 'guest'
  logoutForm.hidden = json.role == 'guest'
  // document.body.setAttribute('data-role', json.role)
  document.body.dataset.role = json.role
  if (json.role == 'user') {
    logoutForm.querySelector('.username').textContent = json.username
  }
}
loadRole()
