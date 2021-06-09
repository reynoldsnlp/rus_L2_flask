l10n_lang = "eng";

l10n = {
	"eng": {
		"errors": {
			"a2o": "o→a",
			"e2je": "e→э",
			"FV": "no fill vowel",
			"H2S": "ъ→ь",
			"i2j": "й→и",
			"i2y": "ы→и",
			"ii": "ие→ии",
			"Ikn": "и→е/я/а",
			"j2i": "и→й",
			"je2e": "э→е",
			"NoFV": "add fill vowel",
			"NoGem": "add double letter",
			"NoSS": "add ь",
			"o2a": "a→o",
			"Pal": "add softening",
			"sh2shch": "щ→ш",
			"shch2sh": "ш→щ",
			"ski": "ский→ски",
			"SRo": "о→е",
			"SRy": "ы→и",
			"y2i": "и→ы",
			"prijti": "прийти",
			"revIkn": "е/я/а→и",
			"Gem": "no double letter",
		},
		"does_not_exist": "does not exist in Russian. Did you mean one of these?",
		"tbl_headers": {
			0: "Dictionary<br>form",
			1: "Error(s)",
			2: "Corrected to...<br>(hover/click to see)",
		},
		"restart": "Start over",
		"powered": "Powered by",
	},

	"nob": {
		"errors": {
			"a2o": "o→a",
			"e2je": "e→э",
			"FV": "ingen flyktig vokal",
			"H2S": "ъ→ь",
			"i2j": "й→и",
			"i2y": "ы→и",
			"ii": "ие→ии",
			"Ikn": "и→е/я/а",
			"j2i": "и→й",
			"je2e": "э→е",
			"NoFV": "legg til en flyktig vokal",
			"NoGem": "legg til en dobbelt bokstav",
			"NoSS": "add ь",
			"o2a": "a→o",
			"Pal": "legg til mykning",
			"sh2shch": "щ→ш",
			"shch2sh": "ш→щ",
			"ski": "ский→ски",
			"SRo": "о→е",
			"SRy": "ы→и",
			"y2i": "и→ы",
			"prijti": "прийти",
			"revIkn": "е/я/а→и",
			"Gem": "ingen dobbelt bokstav",
		},
		"does_not_exist": "finnes ikke på russisk. Mente du en av disse?",
		"tbl_headers": {
			0: "Ordbokform",
			1: "Feil",
			2: "korrigert til...<br>(svev/klikk for å se)",
		},
		"restart": "Begynne på nytt",
		"powered": "Drevet av",
	},
}


set_lang = function (new_lang) {
	l10n_lang = new_lang;

	lang_tags = document.getElementsByClassName("lang");
	for (var i = 0; i < lang_tags.length; i++) {
		lang_tags[i].classList.add("is-light");
	}

	new_lang_tags = document.getElementsByClassName(new_lang);
	new_lang_tags[0].classList.remove("is-light");

	tbl_headers = document.getElementsByTagName("th");
	for (var i = 0; i < tbl_headers.length; i++) {
		tbl_headers[i].innerHTML = l10n[l10n_lang]["tbl_headers"][i];
	}

	restart_button = document.getElementById("restart");
	restart_button.innerHTML = l10n[l10n_lang]["restart"];

	powered = document.getElementById("powered");
	powered.innerHTML = l10n[l10n_lang]["powered"];

	does_not_exist = document.getElementById("does_not_exist");
	does_not_exist.innerHTML = l10n[l10n_lang]["does_not_exist"];

	err_tags = document.getElementsByClassName("tag L2_err_tag is-primary");
	if (err_tags.length > 0) {
		err_tags[0].click();
	}
}


isVisible = function (elm) {
	var rect = elm.getBoundingClientRect();
	var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
	return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}


click_err = function (elem) {
	// alert(elem.dataset.errs);

	err_tokens = document.getElementsByClassName("err");
	for (var i = 0; i < err_tokens.length; i++) {
		err_tokens[i].classList.remove("is-medium", "is-primary", "tag");
		err_tokens[i].classList.add("has-text-link");
	}
	elem.classList.remove("has-text-link");
	elem.classList.add("is-medium", "is-primary", "tag");

	err_json = JSON.parse(elem.dataset.errs);
	readings = '<span class="tag is-medium is-primary">' + elem.innerHTML + '</span> '
	readings += '<span id="does_not_exist">' + l10n[l10n_lang]["does_not_exist"] + '</span>'
	readings += '<table class="table"><tr>'
	readings += '<th>' + l10n[l10n_lang]['tbl_headers'][0] + '</th>'
	readings += '<th>' + l10n[l10n_lang]['tbl_headers'][1] + '</th>'
	readings += '<th>' + l10n[l10n_lang]['tbl_headers'][2] + '</th>'
	readings += '</tr>'
	for (var i = 0; i < err_json.length; i++) {
		r = err_json[i]
		readings += "<tr>"
		readings += "<td><span class=lemma>" + r.lemma + "</span></td> "
		readings += "<td>"
		for (var j = 0; j < r.L2_error_tags.length; j++) {
			readings += '<span class="tag is-clickable is-link is-medium is-rounded L2_err_tag" onclick="fetch_and_load_err_html(this, \'' + r.L2_error_tags[j] + '\')">' + l10n[l10n_lang]["errors"][r.L2_error_tags[j]] + "</span> "
		}
		readings += "</td>"
		readings += '<td><button class="button is-info is-light"><span class="icon"><i class="fas fa-eye-slash"></i></span><span class="button is-info is-inverted is-light is-outlined">' + r.corrected + "</span></button></td>"
		readings += "</tr>"
	}
	readings += "</table>"

	err_readings_div = document.getElementById("error_readings");
	err_readings_div.innerHTML = readings;

	if (err_json.length == 1) {
		if (err_json[0].L2_error_tags.length == 1) {
			err_tags = err_readings_div.getElementsByClassName("L2_err_tag");
			err_tags[0].click()
		}
	} else {
		load_err_html("")
	}
}

fetch_and_load_err_html = function (elem, err_id) {
	err_tags = document.getElementsByClassName("L2_err_tag");
	for (var i = 0; i < err_tags.length; i++) {
		if (err_tags[i].innerHTML == elem.innerHTML) {
			err_tags[i].classList.add("is-primary");
			err_tags[i].classList.remove("is-link");
		} else {
			err_tags[i].classList.remove("is-primary");
			err_tags[i].classList.add("is-link");
		}
	}

	var response = fetch('https://reynoldsnlp.github.io/Reynolds_UiT_ProfII/html/' + l10n_lang + "/" + err_id + '.html')
		.then(response => response.text())
		.then(explanation_src => load_err_html(explanation_src));
}

load_err_html = function (src) {
	var parser = new DOMParser();
	var htmlDoc = parser.parseFromString(src, 'text/html');
	var body = htmlDoc.getElementsByTagName("body");
	var explanation_div = document.getElementById("explanation");
	explanation_div.innerHTML = body[0].innerHTML;
	if (explanation_div.innerHTML != "" && !isVisible(explanation_div)) {
		explanation_div.scrollIntoView({ "behavior": "smooth" })
	}
}
