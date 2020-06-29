import argparse
import os
import sys
from http.client import HTTPException

import celery
import requests
from gevent.pywsgi import WSGIServer

from flask import Flask, request, send_from_directory, send_file, jsonify, logging, Response
from typing import List
import nlp2
import phraseg
from flask_cors import CORS
from time import strftime
import logging
from logging.handlers import RotatingFileHandler
from celery import Celery
from functools import wraps
import asyncio


class ServerError(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        error_dict = dict(self.payload or ())
        error_dict['message'] = self.message
        return error_dict


def async_action(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))

    return wrapped


def make_app(static_dir: str = None) -> Flask:
    static_dir = os.path.abspath(static_dir)
    app = Flask(__name__, static_folder=static_dir)  # pylint: disable=invalid-name

    # API_ENDPOINT = os.environ["API"]
    # API_ENDPOINT = 'http://localhost:8022/api/'

    @app.route('/')
    def index() -> Response:  # pylint: disable=unused-variable
        if static_dir is not None:
            return send_file(os.path.join(static_dir, 'index.html'))

    @app.route('/<path:path>')
    def static_proxy(path: str) -> Response:
        if static_dir is not None:
            return send_from_directory(static_dir, path)
        else:
            return send_file(os.path.join(static_dir, 'index.html'))

    def auth(token):
        if token and token == "2a669d6c9eefaed1df2eabcd85f2b31eadc66663f47aae1e58eafc94b96e0801":
            return True
        else:
            return False



    return app


def main(args):
    parser = argparse.ArgumentParser(description='Serve up a simple model')
    parser.add_argument('--static-dir', default='./build', type=str, help='serve index.html from this directory')
    parser.add_argument('--port', type=int, default=80, help='port to serve the demo on')

    args = parser.parse_args(args)
    app = make_app(static_dir=args.static_dir)
    CORS(app)

    http_server = WSGIServer(('0.0.0.0', args.port), app)
    http_server.serve_forever()


if __name__ == "__main__":
    main(sys.argv[1:])
