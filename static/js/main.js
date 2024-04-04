setLang = function (newLang, l10n) {
	langTags = document.getElementsByClassName("lang");
	for (let i in langTags) {
		langTags[i]?.classList?.add("is-light");
	}
	newLangTags = document.getElementsByClassName(newLang);
	newLangTags[0]?.classList?.remove("is-light");

	tblHeaders = document.getElementsByTagName("th");
	for (let i in tblHeaders) {
		tblHeaders[i].innerHTML = l10n["tbl_headers"][i];
	}

	restartButton = document.getElementById("restart");
	if (restartButton) { restartButton.innerHTML = l10n["restart"] }

	powered = document.getElementById("powered");
	if (powered) { powered.innerHTML = l10n["powered"] }

	doesNotExist = document.getElementById("does-not-exist");
	if (doesNotExist) { doesNotExist.innerHTML = l10n["does_not_exist"] }

	table = document.querySelector("table.error-list");
	if (table) {
		tokId = table.getAttribute("data-tok-id")
		highlightedTag = table.getAttribute("data-highlighted-tag")
		document.getElementById(tokId).click()
		if (highlightedTag) {
			htmx.ajax("GET", `/explanation/${newLang}/${highlightedTag}`, "#explanation").then(() => {highlightL2ErrTag(highlightedTag)})
		}
	}
}


highlightToken = function (elem) {
  errTokens = document.getElementsByClassName("err is-medium is-primary tag");
  for (var i in errTokens) {
    errTokens[i]?.classList?.remove("is-medium", "is-primary", "tag");
    errTokens[i]?.classList?.add("has-text-link");
  }
  elem?.classList?.remove("has-text-link");
  elem?.classList?.add("is-medium", "is-primary", "tag");
}


highlightL2ErrTag = function (L2ErrName) {
	errTags = document.getElementsByClassName("L2-err-tag");
	for (i in errTags) {
		if (errTags[i].classList?.contains(L2ErrName)) {
			errTags[i].classList?.add("is-primary");
			errTags[i].classList?.remove("is-link");
		} else {
			errTags[i].classList?.remove("is-primary");
			errTags[i].classList?.add("is-link");
		}
	}
	table = document.querySelector("table.error-list");
	if (table) {table.setAttribute("data-highlighted-tag", L2ErrName)}
}
