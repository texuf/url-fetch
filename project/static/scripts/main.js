/*** @jsx React.DOM */

var MainComponent = React.createClass({
  handleUrlSubmit: function(data) {
    this.setState({fetching: true});   
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
          parsing:true,
          fetching:false,
          error:false,
        });
        Rainbow.color(html, 'html', function(highlighted_code) {
            self.setState({
              originalHtml: html,
              html: highlighted_code,
              tagStats:tagStats,
              parsing:false
            });
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        this.setState({
          error: true,
          parsing:false,
          fetching:false,
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
          parsing:(startIndex < html.length)
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
          self.colorSubstrings(self, tagStat, i+1, endIndex, html, allHtmls, false);
        }
        else
        {
          allHtmls.push(highlighted_code);
          self.colorSubstrings(self, tagStat, i, endIndex, html, allHtmls, true);
        }
    });
  },
  handleTagClick: function(tag){
    this.colorSubstrings(this, this.state.tagStats[tag], 0, 0, this.state.originalHtml, [], false);
  },
  getInitialState: function() {
    return {html: "", tagStats:{}, parsing:false, fetching:false};
  },
  render: function() {
    return (
      <div>
        <div className="headerContainer">
          <UrlInputForm onUrlSubmit={this.handleUrlSubmit} 
            parsing={this.state.parsing} 
            fetching={this.state.fetching} />
          <StatusView 
            parsing={this.state.parsing} 
            fetching={this.state.fetching}
            error={this.state.error}/>
        </div>
        <div className="mainContainer">
          <div className="leftColumn">
            <TagsDisplayView  
              tagStats={this.state.tagStats}  
              parsing={this.state.parsing}
              onTagClick={this.handleTagClick} 
              parent={this}/>
          </div>
          <div className="rightColumn"> 
            <HtmlDisplayView html={this.state.html} />
            <BearView parsing={this.state.parsing} />
          </div>
        </div>
      </div>
    );
  }
});

var TagsDisplayView = React.createClass({
  render:function(){
    var self=this;
    var tagNodes = Object.keys(this.props.tagStats).map(function(key, index){
      return (
          <div key={key} className="tagName">
            <button 
              className="tagButton" 
              onClick={self.props.onTagClick.bind(self.props.parent, key)}
              disabled={self.props.parsing}>
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

var StatusView = React.createClass({
  getStatus: function(props){
    if(props.parsing)
      return "parsing markup...";
    else if(props.fetching)
      return "fetching url...";
    else if(props.error)
      return "error fetching url...";
    else
      return "";
  },
  render: function(){
    return (<div className="statusContainer">{this.getStatus(this.props)}</div>);
  }
});

var BearView = React.createClass({
  render: function(){
    if(this.props.parsing)
      return (<div className="bearContainer"><img width="172" height="100" src="/static/images/bear.gif"/> </div>)
    else
      return (<div/>)
  }
});

var HtmlDisplayView = React.createClass({
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
        <input type="submit" value="Fetch URL" disabled={this.props.parsing || this.props.fetching} />
      </form>
    );
  }
});

var helloWorld = React.createClass({
  render: function() {
    return (<h2>Greetings, from Real Python!</h2>)
  }
});

ReactDOM.render(
  <MainComponent url="/api/fetch" pollInterval={2000} />,
  document.getElementById('content')
);
