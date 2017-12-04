var server = require('./server.js');
var watson = require('./watsonServer.js');


var setLength = (array, max) => {
  return array.length > max ? array.slice(0, max) : array
}

var extractSentences = (data, maxSentiments, sentenceCount, scoreThreshold) => {
    var sentences = data.sentences_tone
      .map(sentence => {
        sentence.allSentiments = sentence.tones
          .sort((a,b) => {
            return b.score - a.score
          })
          .filter(sentimentObj => {
            return sentimentObj.score >= scoreThreshold
          })
          .map(senti => {
            return senti.tone_name + ': ' + senti.score.toFixed(2);
          })
        delete sentence.tones;
        sentence.allSentiments = setLength(sentence.allSentiments, maxSentiments);
        return sentence;
      });
    // sort by top sentiment
    sentences.sort((a,b) => {
      var first = 0;
      var second = 0;
      if (a.allSentiments.length) {
        first = a.allSentiments[0].split(' ')[1]
      }
      if (b.allSentiments.length) {
      second = b.allSentiments[0].split(' ')[1];
      }
      return second - first;
    })
    //show top n sentences
    sentences = setLength(sentences, sentenceCount);
    //sort by sentence number
    sentences.sort((a,b) => {
      return a.sentence_id - b.sentence_id;
    });
    return sentences;
  }

var sentenceLevelAnalysis = function(rawData, callback) {
    //set max number of sentiments per sentence
    var maxSentiments = 2;
    //set max number of sentences per request
    var sentenceCount = 3;
    //set min score cutoff for each sentiment
    var scoreThreshold = 0;

      callback(null, extractSentences(rawData, maxSentiments, sentenceCount, scoreThreshold));
  };

var overallSentimentAnalysis = function(rawData, callback) {
    var sentiments = rawData.document_tone.tones
    var scores = [0, 0, 0, 0, 0, 0, 0];
    var hash = {
      anger: 0,
      fear: 1,
      joy: 2,
      sadness: 3,
      analytical: 4,
      confident: 5,
      tentative: 6,
    }
    if (sentiments.length) {
      sentiments.map(tone => {
        if (hash.hasOwnProperty(tone.tone_id)) {
          scores[hash[tone.tone_id]] = Number(tone.score.toFixed(4)*100);
        }
      });
    }
    callback(null, scores, rawData);
    };

var getAllWatsonData = function(rawData, callback) {
  watson.analyzeTone(rawData.text, function(err, watsonData) {
  var watsonProcessed = {
    overallData: [],
    sentences: []
  }
  var rawData = JSON.parse(watsonData);
  if (err) {
    console.log(error)
  }
  overallSentimentAnalysis(rawData, function(err, overallData) {
        if (err) {
          console.log(err);
        }
        watsonProcessed.overallData = overallData;
        if (rawData.sentences_tone) {
          sentenceLevelAnalysis(rawData, function(err, sentences) {
          if (err) {
            console.log(err);
          }
          watsonProcessed.sentences = sentences;
        })
      }
    });
  callback(null, watsonProcessed);
  });
};

module.exports.overallSentimentAnalysis = overallSentimentAnalysis;
module.exports.sentenceLevelAnalysis = sentenceLevelAnalysis;
module.exports.getAllWatsonData = getAllWatsonData;