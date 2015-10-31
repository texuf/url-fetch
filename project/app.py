from flask import Flask, render_template, jsonify, request
from pymodules.errors import InvalidUsage

app = Flask(__name__)


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/fetch', methods=['POST'])
def hello():
    data = request.json or request.form
    if not data:
        raise InvalidUsage("No form or json data passed to route")
    if "url" not in data:
        raise InvalidUsage("Malformed data, property [url] was not found.")



    return jsonify(aaaa="burgers", url=data["url"] )


if __name__ == '__main__':
    app.run(debug=True)
