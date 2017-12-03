class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newestTitle: {},
      newestPost: {},
      username: '',
      sentences: [
      {'text': 'I am a dog', 'allSentiments': ['confident: 0.5', 'angry: 0.2']},
      {'text': 'I am a cat', 'allSentiments': ['happy: 0.4']},
      {'text': 'I am a turtle', 'allSentiments': ['slow: 0.6', 'confident: 0.8']}],
      watsonScores: [0.65, .44, 0.15, 0.84, 0.53, 0.25, 0.6]


    }
    this.handleTitle = this.handleTitle.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }



  handlePost(event) {
    this.setState({newestPost: event.target.value})
  }

  handleTitle(event) {
    this.setState({newestTitle: event.target.value})
  }

  handleSubmit(event) {
    var context = this;
    event.preventDefault();
      if (context.props.loggedIn) {

        $.ajax({
          type: 'POST',
          url: '/entries',
          data: {
            title: this.state.newestTitle,
            text: this.state.newestPost,
            username: this.state.username
          },
          success: function() {
            console.log('line 37 input.jsx post success')
          }
        }).then(function() {
          context.props.rerender();
        });

        $.ajax({
          type: 'GET',
          url: '/guest',
          data: {
            text: this.state.newestPost,
          },
          success: function(data) {
            console.log('success get request data ', data.watsonData.sentences, context.state.sentences)
            context.setState({sentences: data.watsonData.sentences}, function() {
              console.log(context.state.sentences)
            })
          }
          })

      } else {
          $.ajax({
          type: 'GET',
          url: '/guest',
          data: {
            text: this.state.newestPost,
          },
          success: function(data) {
            console.log('success get request data ', data.watsonData.sentences, context.state.sentences)
            context.setState({sentences: data.watsonData.sentences}, function() {
              console.log(context.state.sentences)
            })
          }
          })
      }

  }

  componentDidMount() {
    var context = this;
    console.log('MAKE MY CHART', context.state.watsonScores);
    context.makeChart();
    }

    makeChart() {
        console.log('makeChart was called')
        var context = this;
        Highcharts.chart('container', {

            chart: {
                polar: true,
                type: 'line'
            },

            title: {
                text: "Your Text's Sentiments",
                x: -80
            },

            pane: {
                size: '80%'
            },

            xAxis: {
                categories: ['Anger', 'Fear', 'Joy', 'Sadness', 'Analytical', 'Confident', 'Tentative'],
                tickmarkPlacement: 'on',
                lineWidth: 0
            },

            yAxis: {
                gridLineInterpolation: 'polygon',
                lineWidth: 0,
                min: 0
            },

            tooltip: {
                shared: true,
                pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.2f}</b><br/>'
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
                y: 70,
                layout: 'vertical'
            },

            series: [{
        name: 'Sentiment Scores',
        data: context.state.watsonScores,
        pointPlacement: 'on'
    }]

        });
    }

  render() {
    return(
      <div>
      <span><h2 id="hello">Write text to be analyzed</h2><h2 id="hello">Results</h2></span>
      <div id="inputdisplay">
      <form id="text" onSubmit={this.handleSubmit.bind(this)}>

        <input className="form-control" placeholder="Enter title of your super awesome diary entry" name="title" onChange={this.handleTitle}></input><br></br>
        <textarea id="textarea" type='text' name="entry" onChange={this.handlePost} /><br></br>
        <button type="submit" className="btn btn-submit" value="Submit" onClick={this.handleSubmit.bind(this)}>Analyze</button>
      </form>
      </div>

      <div id="results">
      <div id="container"></div>

          </div>

      <div id="impactful">
      Your most impactful sentences:<br/>
          <div>
          {this.state.sentences.map((sentence, i) =>
            <div>
            <div>{sentence.text}</div>
            {sentence.allSentiments.map((emotion) =>
              <div>{emotion}</div>
              )}
            </div>
            )}
          </div><br/>
      </div>

      </div>
    )
  }
}