
function onLoadBar(id){
  document.onclick = function () {
    let dropDownItems = document.getElementById("dropdown-items");
    if (dropDownItems) {
      dropDownItems.style.display = 'none';
    }
  }
}
function search(e){
  let keycode ;
  if(window.event){
    keycode = window.event.code;
  }
  else if(e){
    keycode = e.code
  }
  if(keycode == "Enter"){
    SearchSubmit();
  }
}
function SearchSubmit() {
  let inputSearch = document.getElementById("search-input");
  let query = inputSearch.value;
  
  if (query !== '') {
    fetch(`/groups-data?query=${query}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        var dropDownItems = document.getElementById("dropdown-items");
        dropDownItems.innerHTML = `
                            ${data.map((item) => {
                        return `<a class="dropdown-item" href="/group/${item.id}">${item.name}</a>`
                    }).join('')}
                        `
        dropDownItems.style.display = "flex";
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
