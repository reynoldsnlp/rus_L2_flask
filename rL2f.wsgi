import logging
from logging.handlers import RotatingFileHandler
from logging import Formatter
from os.path import dirname
import sys

import stanza

# add this directory to PATH before trying to import rrf
script_path = dirname(__file__)
sys.path.insert(0, script_path)

from rL2f import app as application


# stanza.download('ru', verbose=False)

level = logging.INFO

application.logger.setLevel(level)

# see http://flask.pocoo.org/docs/0.10/errorhandling/
file_handler = RotatingFileHandler(script_path
                                   + '/rus_L2_flask_err.log',
                                   encoding='utf-8')
file_handler.setLevel(level)
file_handler.setFormatter(Formatter('%(asctime)s %(levelname)s: %(message)s '
                                    # '[in %(pathname)s:%(lineno)d]'
                                    )
                          )
application.logger.addHandler(file_handler)
