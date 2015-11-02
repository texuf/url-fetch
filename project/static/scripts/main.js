/*** @jsx React.DOM */

var MainComponent = React.createClass({
  handleUrlSubmit: function(data) {
    //this.setState({data: newComments});   
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: data,
      success: function(data) {
        console.log("success!!!", data.tagStats)

        var self = this;
        var tagStats = data.tagStats;
        var html = data.html;
        self.setState({
          originalHtml: html,
          html: undefined,
          tagStats:tagStats,
          parsing:true
        });
        Rainbow.color(html, 'html', function(highlighted_code) {
            console.log("colored!")
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
      }.bind(this)
    });
  },
  colorSubstrings: function(self, tagStat, i, startIndex, html, allHtmls, highlight){
    //console.log("color!!!", tagStat, i, startIndex)
    
      self.setState({
            originalHtml: self.state.originalHtml,
            html: allHtmls.join(""),
            tagStats:self.state.tagStats,
            parsing:false
          });
    if(startIndex == html.length)
    {
      return;
    }
    var endIndex = 
      (i == tagStat.length)
      ? html.length
      : (highlight)
        ? tagStat[i][1]
        : tagStat[i][0];
    
    var substring = html.substring(startIndex, endIndex);
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
    var tagStat = this.state.tagStats[tag];
    var html = this.state.originalHtml;
    console.log("handle tag click!" +tag+" : "+tagStat)
    var start_index = 0;
    var allHtmls = [];
    this.colorSubstrings(this, tagStat, 0, 0, html, [], false);
  },
  getInitialState: function() {
    return {html: undefined, tagStats:{}, parsing:false};
  },
  render: function() {
    var leftStyle={
      width: '200px',
      float: 'left',
      marginTop: '12px'
    };
    var rightStyle={
      marginLeft: '210px'
    };
    var mainStyle={
      width: '100%',
      overflow: 'hidden'
    };
    return (
      <div>
        <div className="commentBox">
          <h1>Enter a Url</h1>
          <UrlInputForm onUrlSubmit={this.handleUrlSubmit} />
        </div>
        <div style={mainStyle}>
          <div style={leftStyle}>
            <TagsDisplayView  tagStats={this.state.tagStats}  onTagClick={this.handleTagClick} parent={this}/>
          </div>
          <div style={rightStyle}> 
            <HtmlDisplayView html={this.state.html} parsing={this.state.parsing}/>
          </div>
        </div>
      </div>
    );
  }
});

var TagsDisplayView = React.createClass({
  handleClick: function(event) {
    console.log("handle click "+event)
  },
  render:function(){
    console.log("TAGS DISPLAY VIEW " +this.props.tagStats)
    var self=this;
    var tagStyle = {
      width:'100%',
      marginBottom: '2px'
    };
    var buttonStyle = {
      width:'100%'
    };
    var tagNodes = Object.keys(this.props.tagStats).map(function(key, index){
      return (
          <div key={key} style={tagStyle}>
            <button style={buttonStyle} selected={true} onClick={self.props.onTagClick.bind(self.props.parent, key)}>
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

var HtmlDisplayView = React.createClass({
  createMarkup: function(html){
    
    return {__html:html}
  },
  render: function(){
    var html = this.props.html;
    if(html)
    {
      return (
        <pre><div dangerouslySetInnerHTML={this.createMarkup(html)} /></pre>
        );
    }
    else
    {
      return (<div/>);
    }
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
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" defaultValue="slack.com"  ref="url" />
        <input type="submit" value="Post" />
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
  document.getElementById('content'),
  function(){ console.log("render callback!")}
);
