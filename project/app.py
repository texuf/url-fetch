from collections import defaultdict
from flask import Flask, render_template, jsonify, request
from pymodules.errors import InvalidUsage
import requests
import bs4 as BS
import logging


app = Flask(__name__)
log_handler = logging.StreamHandler()
log_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s '
    '[in %(pathname)s:%(lineno)d]'))
app.logger.addHandler(log_handler)
app.logger.setLevel(logging.DEBUG)

@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.route('/')
def get_index():
    return render_template('index.html')


@app.route('/api/fetch', methods=['POST'])
def api_fetch():
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
    app.logger.info("URL: %s", url)
    #make the request
    try:
        resp = requests.get(url)
    except requests.ConnectionError as exception:
        raise InvalidUsage("The request failed with the exception: %s" % 
            str(exception), 404)
    #get the html
    html = resp.text
    #parse the html
    soup = BS.BeautifulSoup(html, 'html.parser')
    html = soup.prettify()
    soup = BS.BeautifulSoup(html, 'html.parser') #soup the html again to get spaces
    
    stats = defaultdict(list)
    find_tag_substrings(soup, html, stats)

    #return json
    return jsonify(url=url, html=html, tagStats=stats)



def find_tag_substrings(soup, html, stats, index = 0):
    if soup and soup.name:
        if soup.name != "[document]":
            #print soup.name
            substring =  str(soup)
            search_start = substring[0:min(4, len(substring))]
            search_end = "\n"
            substring_start = html.find(search_start, index)
            if substring_start >= 0:
                index = max(index, substring_start + 1)
                while substring_start > 0 and html[substring_start-1] == " ":
                    substring_start -= 1
                substring_end = html.find(search_end, index) + len(search_end)
                stats[soup.name].append((substring_start, substring_end))
                #print (substring_start, substring_end)
                #print html[substring_start:substring_end] 
        for x in soup.contents:
            index = find_tag_substrings(x, html, stats, index)
    return index


if __name__ == '__main__':
    app.run(debug=True)
