"""Flask webapp to sort Russian words by frequency."""

import json
import re

from flask import Flask
from flask import request
from flask import render_template
# from flask import url_for
import udar

app = Flask(__name__)
application = app  # our hosting requires `application` in passenger_wsgi


def absent():
    """Used as default in defaultdict's."""
    return 0


# @app.route('/')
# def freq_form():
#     """Start page."""
#     return render_template("freq_form.html")

# passenger sets '/' to be the path registered in cPanel
@app.route('/', methods=['GET', 'POST'])
def freq_form_post():
    """Build Russian frequency sorter page."""
    if request.method == 'GET':
        return render_template("entry_form.html")
    elif request.method == 'POST':
        doc = udar.Document(request.form['text'], analyze_L2_errors=True)
        text_html = doc2html(doc)
        return render_template('output.html', text_html=text_html)


def doc2html(doc):
    """Convert udar.Document to html marking L2 errors using <span> tags."""

    return re.sub(r' [.?!]', '', ' '.join(tok2html(tok) for tok in doc))


def tok2html(tok):
    """Convert udar.Token to html <span>.

    The data-err attribute has the following structure:
        {lemma: {uniq_tag(s): [[err1, err2], corrected],
                 uniq_tag(s): [[err1], corrected],
         lemma2: ...}

    """
    if tok.is_L2_error():
        err_list = []
        already_seen = set()
        for reading in tok.readings:
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
                             'corrected': corrected})
        # title = f'''title="{' '.join(all_L2_error_tags)} {corrected}" '''
        err_json = json.dumps(err_list, ensure_ascii=False)
        print(err_json)
        return f'''\n<span class="tag err is-clickable is-link" data-errs='{err_json}' onclick="click_err(this)">{tok.text}</span>'''
    else:
        return tok.text


if __name__ == "__main__":
    app.debug = True
    app.run()
