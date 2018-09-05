from flask import jsonify, request

from lib.module import handler
from lib.router import app
from lib.util import status


def create_app():
    @app.before_request
    def filter_request():
        initialize = status.get_cluster_initialize_status()
        login = handler.cookie(request.cookies.get('login'))
        api = handler.api(request.path)
        api_before_initialize = ['checkclusterenv', 'init']
        api_after_initialize = ['getdefaultuser']
        api_always_pass = [
            'syncsystemstatus', 'getraidrecommendedconfiguration', 'getdisklist', 'receiveevent']
        api_login = ['login']
        if initialize:
            if api in api_login + api_always_pass + api_after_initialize or login:
                if api not in api_before_initialize:
                    pass
                else:
                    return jsonify(handler.response(1, 'The cluster has been initialized!'))
            else:
                return jsonify(handler.response(1, 'The current user is not logged in!'))
        else:
            if api in api_always_pass + api_before_initialize:
                pass
            else:
                return jsonify(handler.response(1, 'The cluster is not initialized!'))

    @app.before_request
    def handle_parameter():
        if request.method == 'GET':
            request.params = request.args.to_dict()
        elif request.content_type is not None and 'json' in request.content_type:
            request.params = request.get_json(silent=True)
        else:
            request.params = request.form.to_dict()

    @app.after_request
    def sync_status(response):
        initialize_cookie = handler.cookie(request.cookies.get('init'))
        initialize_status = status.get_cluster_initialize_status()
        initialize_cookie != initialize_status and response.set_cookie(
            'init', str(initialize_status).lower())
        not initialize_status and response.set_cookie('login', 'false')
        return response

    return app
