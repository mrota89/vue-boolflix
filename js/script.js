new Vue({
  el: '#app',

  data: {
    query:'',
    resultFor: '',
    listaFilm: [],
    maxVote: 5
  },

  methods: {
    cercaFilm: function() {
      const self = this;
      axios
      .get(`https://api.themoviedb.org/3/search/movie?api_key=87afaf40f86102cb8e49027ba59c133d&query=${self.query}`)
      .then(function(xhr) {
        let dataObject = xhr.data;
        self.listaFilm = dataObject.results;
        self.voteFive();
        self.resultFor = `risultati per: ${self.query}`
        self.query = "";
      })
    },
    voteFive: function() {
      let round;
      let whiteStar;
      let number_ws;
      this.listaFilm.forEach((element) => {
        const {vote_average} = element
        round = Math.round(element.vote_average / 2);
        element.vote_average = round;
        whiteStars = this.maxVote - round
        element.number_ws = whiteStars
      });
    },
    flagLang: function(index) {
      const flagImage = this.listaFilm[index].original_language;
      const imageString = `flag-svg/${flagImage}.svg`;
      return imageString;
    }
  }
})

Vue.config.devtools = true;
