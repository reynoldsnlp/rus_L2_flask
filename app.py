"""Flask webapp to automatically correct Russian L2 errors."""

import json
import re

from flask import Flask
from flask import request
from flask import render_template
from flask import Response
import requests
import udar

Sharoff_lem_freq_dict = udar.features.features._get_Sharoff_lem_freq_dict()

# The following sentence is used if the user enters nothing
DEFAULT_UI_LANG = "eng"
EXAMPLE_SENT = 'ПРИМЕР: Ана не хочит мить пасуду в кафетерие, но мы скозали эй, что обизателно надо.'
EXPLANATION_BASE_URL = "https://reynoldsnlp.github.io/rus_grammar_explanations/html/"

app = Flask(__name__)
application = app  # our hosting requires `application` in passenger_wsgi

# app.jinja_env.add_extension('jinja2.ext.debug')  # enables <pre>{% debug %}</pre>

with open("l10n.json") as f:
    l10n = json.load(f)


@app.get('/')
def index():
    l10n_lang = request.cookies.get("rumor-l10n-lang", DEFAULT_UI_LANG)
    return render_template("index.html", l10n=l10n[l10n_lang], l10n_lang=l10n_lang)


@app.get('/corrected/<show>/<corrected_wordform>')
def corrected(show, corrected_wordform):
    if show == "show":
        show = "hide"
    elif show == "hide":
        show = "show"
    return render_template("corrected.html",
                           show=show,
                           corrected_wordform=corrected_wordform)


@app.get('/entry-form')
def entry_form():
    return render_template('entry-form.html')


@app.post('/error-list')
def error_list():
    l10n_lang = request.cookies.get("rumor-l10n-lang", DEFAULT_UI_LANG)
    error_json = request.form.get('error-list', "").replace('`', '"')  # TODO ticks are brittle
    tok_id = request.form.get('id', "")
    orig = request.form.get('orig', "")
    if error_json:
        errors = json.loads(error_json)
        return render_template("error-list.html",
                               errors=errors,
                               l10n=l10n[l10n_lang],
                               l10n_lang=l10n_lang,
                               orig=orig,
                               tok_id=tok_id)
    else:
        return "No errors"


@app.get("/explanation/<lang>/<L2_err_tag>")
def explanation(lang, L2_err_tag):
    resp = requests.get(f"{EXPLANATION_BASE_URL}/{lang}/{L2_err_tag}.html")
    return resp.text


@app.get('/l10n/<l10n_lang>')
def set_l10n_lang(l10n_lang):
    resp = Response(render_template('l10n.html', l10n=l10n[l10n_lang], l10n_lang=l10n_lang))
    resp.headers["HX-Trigger-After-Swap"] = f'{{"setL10nLangForHighlightedTokenAndTag": "{l10n_lang}"}}'
    resp.headers['Set-Cookie'] = f"rumor-l10n-lang={l10n_lang}; Path=/"  # TODO: use URL args instead
    return resp


@app.post('/process-input')
def process_input():
    l10n_lang = request.cookies.get("rumor-l10n-lang", DEFAULT_UI_LANG)
    text = request.form['text'].strip() or EXAMPLE_SENT
    doc = udar.Document(text, analyze_L2_errors=True, disambiguate=True)
    text_html = doc2html(doc)
    return render_template('output.html', text_html=text_html, l10n=l10n[l10n_lang])


def doc2html(doc):
    """Convert udar.Document to html marking L2 errors using <span> tags."""
    return re.sub(r' [.?!]', '', ' '.join(tok2html(i, tok)
                                          for i, tok in enumerate(doc)))


def tok2html(i, tok):
    """Convert udar.Token to html <span>.

    The hx-vals attribute has the following structure:
        {lemma: {uniq_tag(s): [[err1, err2], corrected],
                 uniq_tag(s): [[err1], corrected],
         lemma2: ...}
    """
    if tok.is_L2_error():
        err_list = []
        already_seen = set()
        for reading in sorted(tok.readings,
                              key=lambda x: Sharoff_lem_freq_dict.get(' '.join(x.lemmas), 0),
                              reverse=True):
            corrected = reading.generate(corrected=True)
            uniq_tags = [tag.name for tag in reading
                         if all(tag not in reading2
                                for reading2 in tok.readings
                                if reading2 is not reading)]
            L2_error_tags = sorted(tag.name.replace('Err/L2_', '')
                                   for tag in reading
                                   if tag.is_L2_error)
            signature = (tuple(reading.lemmas), tuple(L2_error_tags), corrected)
            if signature in already_seen:
                continue
            else:
                already_seen.add(signature)
            err_list.append({'lemma': ' '.join(reading.lemmas),
                             'tags': [tag.name for tag in reading.grouped_tags],
                             'uniq_tags': uniq_tags,
                             'L2_error_tags': L2_error_tags,
                             'orig': tok.text,
                             'corrected': corrected,
                             'freq': Sharoff_lem_freq_dict.get(' '.join(reading.lemmas), 0)})
        # title = f'''title="{' '.join(all_L2_error_tags)} {corrected}" '''
        err_json = json.dumps(err_list, ensure_ascii=False).replace('"', '`')
        return f'''\n<a id="tok-{i}"
                        class="err has-text-link"
                        hx-post="/error-list"
                        hx-target="#error-list"
                        hx-on::before-request="highlightToken(this)"
                        hx-vals='{{"error-list": "{err_json}", "id": "tok-{i}", "orig": "{tok.text}"}}'
                        >{tok.text}</a>'''
    else:
        return tok.text


if __name__ == "__main__":
    app.debug = True
    app.run()
