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
        console.log("success!!!")
        //this.setState({data: {html:data.html+}})

        self = this;
        
        Rainbow.color(data.html, 'html', function(highlighted_code) {
            console.log("colored!")
            self.setState({data: {html:highlighted_code}})
        });

        
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: {}, parsing:false};
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Enter a Url</h1>
        <UrlInputForm onUrlSubmit={this.handleUrlSubmit} />
        <HtmlDisplayView data={this.state.data} parsing={this.state.parsing} />
      </div>
    );
  }
});

var HtmlDisplayView = React.createClass({
  createMarkup: function(html){
    //'<span class="highlight">'+
    //+'</span>'
    return {__html:html}
  },
  render: function(){
    var data = this.props.data;
    if(data.html)
    {
      return (
        <pre><div dangerouslySetInnerHTML={this.createMarkup(data.html)} /></pre>
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
        <input type="text" defaultValue="austinwellis.com/"  ref="url" />
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
