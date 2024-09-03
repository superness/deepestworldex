function clearMenuButtons() {
    let tempButtons = window.top.document.getElementsByClassName('temp-btn')

    while (tempButtons.length > 0) {
        tempButtons[0].remove()
    }

    window.top.document.getElementsByClassName('toggle-menu')[0].classList.add('me-1')
    window.top.document.getElementById('menuButtonsContextMenu')?.remove()
}

function addMenuButton(title, onclick, parentDiv = window.top.document.getElementById('minimenu')) {
    var newi = window.top.document.createElement('i')
    newi.class = 'fa-solid'
    newi.innerText = title

    newi.onclick = () => onclick(newi)

    var newMenuButton = window.top.document.createElement('div')
    newMenuButton.className = 'ui-btn px-1 me-1 temp-btn'

    newMenuButton.appendChild(newi)

    parentDiv.appendChild(newMenuButton)
}




function addMenuButtonContextMenu() {
    let menuButtons = window.top.document.getElementById('minimenu')
    let menuButtonsContextMenu = window.top.document.createElement('div')

    menuButtonsContextMenu.className = "ui ui-content invisible"
    menuButtonsContextMenu.style = "position:absolute;bottom:50px;right:5px;"
    menuButtonsContextMenu.id = 'menuButtonsContextMenu'

    menuButtons.appendChild(menuButtonsContextMenu)

}

function toggleMenuButtonContextMenu() {
    let menuButtonsContextMenu = window.top.document.getElementById('menuButtonsContextMenu')
    if (menuButtonsContextMenu.className.includes('invisible')) {
        menuButtonsContextMenu.classList.remove('invisible')
    }
    else {
        menuButtonsContextMenu.classList.add('invisible')
    }
}

function addMenuContextMenuButton(title, onclick) {
    let menuButtonsContextMenu = window.top.document.getElementById('menuButtonsContextMenu')

    addMenuButton(title, onclick, menuButtonsContextMenu)
}



clearMenuButtons()
addMenuButtonContextMenu()
addMenuButton('⚙️', e => {
    toggleMenuButtonContextMenu()
})