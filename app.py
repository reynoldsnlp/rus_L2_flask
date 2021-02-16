"""Flask webapp to sort Russian words by frequency."""
from random import choice

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
    return ' '.join(tok2html(tok) for tok in doc)


def tok2html(tok):
    """Convert udar.Token to html <a>."""
    url_base = 'https://reynoldsnlp.github.io/Reynolds_UiT_ProfII/html/'
    if tok.is_L2_error():
        L2_error_tags = {tag.name.replace('Err/L2_', '')
                         for reading in tok.readings
                         for subreading in reading.subreadings
                         for tag in subreading
                         if tag.is_L2_error}
        corrected = ' '.join({reading.generate(corrected=True)
                              for reading in tok.readings})
        title = f'''title="{' '.join(L2_error_tags)} {corrected}" '''
        if len(L2_error_tags) > 1:
            class_ = f'class="err multi-err" '
        else:
            class_ = 'class="err" '
        err = choice(list(L2_error_tags))
        href = f'href="{url_base}{err}.html"'
        return f'''\n<a {class_}{title}{href} target="explanation">{tok.text}</a>'''
    else:
        return tok.text


if __name__ == "__main__":
    app.debug = True
    app.run()
