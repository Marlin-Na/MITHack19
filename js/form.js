
function form_on_submit() {
    let form_dom = document.getElementById("profile-form");
    //let new_url = new URL(form_dom.action);
    //new_url.searchParams.append("inputKeyWords", form_dom.inputKeyWords.value);
    //form_dom.action = new_url.toString();
    //console.log(form_dom);
    form_dom.inputHiddenURLParam.value = form_dom.inputKeyWords.value;

    return true;
}

