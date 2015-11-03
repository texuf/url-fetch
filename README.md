# url-fetch

Fetches url, counts tags, displays tags interactively to the user

### heroku deets

https://stormy-falls-9283.herokuapp.com/ | https://git.heroku.com/stormy-falls-9283.git

### Prerequisites

* python
* pip http://pip.readthedocs.org/en/stable/installing/
* virtualenv http://docs.python-guide.org/en/latest/dev/virtualenvs/

### Setup instructions
    
    virtualenv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ./run.sh

### React Babel Setup
    npm install --global babel-cli
    npm install babel-preset-react
    babel --presets react project/static/scripts/ --watch --out-dir project/static/build

### Tutorial Sources

* Flask/React dev env: https://realpython.com/blog/python/the-ultimate-flask-front-end/  
* React setup: https://facebook.github.io/react/docs/getting-started.html  
* React tutorial: http://facebook.github.io/react/docs/tutorial.html  
* Heroku tutorial: https://devcenter.heroku.com/articles/getting-started-with-python-o  
* BeautifulSoup for html parsing http://www.crummy.com/software/BeautifulSoup/bs4/doc/
* Rainbows for html formatting: https://craig.is/making/rainbows  
