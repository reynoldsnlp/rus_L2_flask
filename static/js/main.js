click_err = function(elem) {
	// alert(elem.dataset.errs);

	err_tokens = document.getElementsByClassName("err");
	for (var i = 0; i < err_tokens.length; i++) {
		err_tokens[i].classList.remove("is-primary");
		err_tokens[i].classList.add("is-link");
	}
	elem.classList.add("is-primary");
	elem.classList.remove("is-link");

	err_json = JSON.parse(elem.dataset.errs);
	readings = '<table class="table"><tr><th>Dictionary<br>form</th><th>Error(s)</th><th>Corrected to...<br>(hover/click to see)</th></tr>'
	for (var i = 0; i < err_json.length; i++) {
		r = err_json[i]
		readings += "<tr>"
		readings += "<td><span class=lemma>" + r.lemma + "</span></td> "
		readings += "<td>"
		for (var j = 0; j < r.L2_error_tags.length; j++) {
			readings += '<span class="tag is-clickable is-link L2_err_tag" onclick="fetch_and_load_err_html(this)">' + r.L2_error_tags[j] + "</span> "
		}
		readings += "</td>"
		readings += '<td><span class="icon"><i class="fas fa-eye-slash"></i></span><span class="spoiler">' + r.corrected + "</span></td>"
		readings += "</tr>"
	}
	readings += "</table>"

	err_readings_div = document.getElementById("error_readings");
	err_readings_div.innerHTML = readings;

	if (err_json.length == 1) {
		if (err_json[0].L2_error_tags.length == 1) {
			err_tags = err_readings_div.getElementsByClassName("L2_err_tag");
			fetch_and_load_err_html(err_tags[0])
		}
	} else {
		load_err_html("")
	}
}

fetch_and_load_err_html = function(elem) {
	err_tags = document.getElementsByClassName("L2_err_tag");
	for (var i = 0; i < err_tags.length; i++) {
		err_tags[i].classList.remove("is-primary");
		err_tags[i].classList.add("is-link");
	}
	elem.classList.add("is-primary");
	elem.classList.remove("is-link");

	var response = fetch('https://reynoldsnlp.github.io/Reynolds_UiT_ProfII/html/' + elem.innerHTML + '.html')
	.then(response => response.text())
	.then(explanation_src => load_err_html(explanation_src));
}

load_err_html = function(src) {
	var parser = new DOMParser();
	var htmlDoc = parser.parseFromString(src, 'text/html');
	var body = htmlDoc.getElementsByTagName("body");
	var explanation_div = document.getElementById("explanation");
	explanation_div.innerHTML = body[0].innerHTML;
	if (explanation_div.innerHTML != "") {
		explanation_div.scrollIntoView({"behavior": "smooth"})
	}
}
