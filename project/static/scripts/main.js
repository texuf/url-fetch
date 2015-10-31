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
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Enter a Url</h1>
        <UrlInputForm onUrlSubmit={this.handleUrlSubmit} />
      </div>
    );
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
    ReactDOM.findDOMNode(this.refs.url).value = '';
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Enter Url" ref="url" />
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
  document.getElementById('content')
);
