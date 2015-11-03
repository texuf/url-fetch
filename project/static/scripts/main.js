/*** @jsx React.DOM */

var AppState = {
  None:0,
  Fetching:1,
  Parsing:2,
  Error:3
};


var MainComponent = React.createClass({
  handleUrlSubmit: function(data) {
    this.setState({appState: AppState.Fetching});   
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: data,
      success: function(data) {
        var self = this,
            tagStats = data.tagStats,
            html = data.html;
        self.setState({
          originalHtml: html,
          html: undefined,
          tagStats:tagStats,
          appState:AppState.Parsing,
        });
        Rainbow.color(html, 'html', function(highlighted_code) {
            self.setState({
              originalHtml: html,
              html: highlighted_code,
              tagStats:tagStats,
              appState:AppState.None,
            });
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        this.setState({
          appState:AppState.Error,
          html: undefined,
          tagStats:{},
        });
      }.bind(this)
    });
  },
  colorSubstrings: function(self, tagStat, i, startIndex, html, allHtmls, highlight){
    self.setState({
      originalHtml: self.state.originalHtml,
      html: allHtmls.join(""),
      tagStats:self.state.tagStats,
      appState:(startIndex < html.length) ? AppState.Parsing : AppState.None,
    });
    if(startIndex == html.length)
      return;
    var endIndex = (i == tagStat.length)
                    ? html.length
                    : (highlight)
                      ? tagStat[i][1]
                      : tagStat[i][0],
       substring = html.substring(startIndex, endIndex);
    Rainbow.color(substring, 'html', function(highlighted_code) {
        if(highlight)
        {
          allHtmls.push('<span class="highlight">'+highlighted_code+'</span>');
          i=i+1;
        }
        else
        {
          allHtmls.push(highlighted_code);
        }
        self.colorSubstrings(self, tagStat, i, endIndex, html, allHtmls, !highlight);
    });
  },
  handleTagClick: function(tag){
    this.colorSubstrings(this, this.state.tagStats[tag], 0, 0, this.state.originalHtml, [], false);
  },
  getInitialState: function() {
    return {
      html: "", 
      tagStats:{}, 
      appState:AppState.None,
    };
  },
  render: function() {
    return (
      <div>
        <div className="headerContainer">
          <UrlInputForm onUrlSubmit={this.handleUrlSubmit} 
            appState={this.state.appState} />
          <StatusContainer appState={this.state.appState}/>
        </div>
        <div className="mainContainer">
          <div className="leftColumn">
            <TagsContainer  
              tagStats={this.state.tagStats}  
              appState={this.state.appState}
              onTagClick={this.handleTagClick} 
              parent={this}/>
          </div>
          <div className="rightColumn"> 
            <HtmlContainer html={this.state.html} />
            <LoadingIcon appState={this.state.appState} />
          </div>
        </div>
      </div>
    );
  }
});

var TagsContainer = React.createClass({
  render:function(){
    var self=this;
    var tagNodes = Object.keys(this.props.tagStats).map(function(key, index){
      return (
          <div key={key} className="tagName">
            <button 
              className="tagButton" 
              onClick={self.props.onTagClick.bind(self.props.parent, key)}
              disabled={self.props.appState == AppState.Parsing}>
              {key} ({self.props.tagStats[key].length}) 
            </button>
          </div>
        )
    });
    return (
        <div className="tagList">
          {tagNodes}
        </div>
    );
  }
});

var StatusContainer = React.createClass({
  getStatus: function(appState){
    if(appState == AppState.Parsing)
      return "parsing markup...";
    else if(appState == AppState.Fetching)
      return "fetching url...";
    else if(appState == AppState.Error)
      return "error fetching url...";
    else
      return "";
  },
  render: function(){
    return (<div className="statusContainer">{this.getStatus(this.props.appState)}</div>);
  }
});

var LoadingIcon = React.createClass({
  render: function(){
    if(this.props.appState == AppState.Parsing)
      return (<div className="bearContainer"><img width="172" height="100" src="/static/images/bear.gif"/> </div>)
    else
      return (<div/>)
  }
});

var HtmlContainer = React.createClass({
  createMarkup: function(html){
    return {__html:html}
  },
  render: function(){
    var html = this.props.html;
    if(html)
      return (<pre><div dangerouslySetInnerHTML={this.createMarkup(html)}/></pre>);
    else
      return (<div/>);
  }
});

var UrlInputForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var url = ReactDOM.findDOMNode(this.refs.url).value.trim();
    if (!url) {
      return;
    }
    this.props.onUrlSubmit({url: url});
  },
  render: function() {
    return (
      <form className="urlForm" onSubmit={this.handleSubmit}>
        <input type="text" defaultValue="slack.com"  ref="url" />
        <input type="submit" 
          value="Fetch URL" 
          disabled={ this.props.appState == AppState.Parsing 
                     || this.props.appState == AppState.Fetching} />
      </form>
    );
  }
});

ReactDOM.render(
  <MainComponent url="/api/fetch" pollInterval={2000} />,
  document.getElementById('content')
);
