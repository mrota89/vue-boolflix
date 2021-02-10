new Vue({
  el: '#app',

  data: {
    query:'',
    resultFor: '',
    listaFilm: [],
    listaSerie: [],
    maxVote: 5
  },

  methods: {
    searchAll: function() {
      this.searchMovie();
      this.searchSeries();
    },

    searchMovie: function() {
      const self = this;
      axios
      .get(('https://api.themoviedb.org/3/search/movie'), {
        params: {
          api_key: '87afaf40f86102cb8e49027ba59c133d',
          query: self.query,
          language: 'it-IT'
        }
      })
      .then(function(xhr) {
        let dataObject = xhr.data;
        self.listaFilm = dataObject.results;
        self.voteFive(self.listaFilm);
      });
    },

    searchSeries: function() {
      const self = this;
      axios
      .get(('https://api.themoviedb.org/3/search/tv'), {
        params: {
          api_key: '87afaf40f86102cb8e49027ba59c133d',
          query: self.query,
          language: 'it-IT'
        }
      })
      .then(function(xhr) {
        let dataObject = xhr.data;
        self.listaSerie = dataObject.results;
        self.voteFive(self.listaSerie);
        self.resultFor = `risultati per: ${self.query}`;
        self.query = "";
      });
    },

    voteFive: function(lista) {
      let round;
      let whiteStar;
      let number_ws;
      lista.forEach((element) => {
        const {vote_average} = element
        round = Math.round(element.vote_average / 2);
        element.vote_average = round;
        whiteStars = this.maxVote - round
        element.number_ws = whiteStars
      });
    },

    flagLang: function(index, lista) {
      const flagImage = lista[index].original_language;
      const imageString = `flag-svg/${flagImage}.svg`;
      return imageString;
    }
  }
})

Vue.config.devtools = true;
