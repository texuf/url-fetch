from flask import Flask, render_template, jsonify, request
from pymodules.errors import InvalidUsage
import requests
import bs4 as BS

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
    #grab the data from either json or form
    data = request.json or request.form
    #check for errors
    if not data:
        raise InvalidUsage('No form or json data passed to route')
    if 'url' not in data:
        raise InvalidUsage('Malformed data, property [url] was not found.')
    #grab the url
    url = data['url']
    if not '://' in url:
        url = 'http://%s' % url
    #make the request
    resp = requests.get(url)
    #get the html
    html = resp.text
    #parse the html
    soup = BS.BeautifulSoup(html, 'html.parser')
    html = soup.prettify()
    soup = BS.BeautifulSoup(html, 'html.parser')


    stats = {}
    #return json
    return jsonify(url=url, html=html, stats=stats)


if __name__ == '__main__':
    app.run(debug=True)
