new Vue({
  el: '#app',

  data: {
    apiKey: '87afaf40f86102cb8e49027ba59c133d',
    flagDisplayHome: true,
    flagDisplaySection: false,
    query:'',
    resultFor: '',
    listaDaMostrare: [],
    listaFilm: [],
    listaSerie: [],
    dataListaTrend: [],
    listaTrend: [],
    listaIdFilm: [],
    listaIdSerie: [],
    scelte: ['Home', 'Film', 'Serie TV'],
    scelteIDX: 0,
    maxVote: 5,
    lengFlagAv: ['ja', 'de', 'en', 'es', 'fr', 'it', 'pt']
  },

  mounted() {
    /*al caricamento della pagina, mostra un film/serie tv preso randomicamente
     dall'apposita api*/
    axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${this.apiKey}`)
    .then((xhr) => {
      this.dataListaTrend = xhr.data;
      this.thenShowMostView();
    })
  },

  methods: {
    searchAll: function() {
      this.scelteIDX = 1;
      this.searchMovie();
      this.searchSeries();
      setTimeout(() => {
        this.query = "";
      }, 5000)
    },

    searchMovie: function() {
      this.ajaxCall('https://api.themoviedb.org/3/search/movie')
      .then((xhr) => {
        this.flagDisplaySection = false;
        let dataObject = xhr.data;
        this.listaIdFilm = [];
        this.listaFilm = dataObject.results;
        this.voteFive(this.listaFilm);
        this.changeTab(this.scelteIDX);
        this.IdElemFunction(this.listaFilm, this.listaIdFilm);
        this.genreCall('https://api.themoviedb.org/3/genre/movie/list', this.listaFilm);
        this.actorCallsFilm();
        this.displayDelay();
        this.queryResult();
      });
    },

    searchSeries: function() {
      this.ajaxCall('https://api.themoviedb.org/3/search/tv')
      .then((xhr) => {
        this.flagDisplaySection = false;
        let dataObject = xhr.data;
        this.listaIdSerie = [];
        this.listaSerie = dataObject.results;
        this.voteFive(this.listaSerie);
        this.changeTab(this.scelteIDX);
        this.IdElemFunction(this.listaSerie, this.listaIdSerie);
        this.genreCall('https://api.themoviedb.org/3/genre/tv/list', this.listaSerie);
        this.actorCallsSerie();
        this.displayDelay();
        this.queryResult();
      });
    },


    // restituisce l'esecuzione della chiamata axios
    ajaxCall: function(URL) {
      return axios.get(URL, {
        params: {
          api_key: this.apiKey,
          query: this.query,
          language: 'it-IT',
        },
      });
    },

    /* viene eseguito nel then dopo la chiamata axios alla api per i credits,
      andando a pushare nell'oggetto film/serie il corrispondente array di attori*/
    thenCallsActors: function(lista, dataObject, indexElementIdList) {
      let arrayAttori = [];
      //in questo modo prendo solo i primi 5 attori
      if(dataObject.length > 5) {
        dataObject.length = 5
      }
      //pusho in un array i nomi degli attori
      for (let i = 0; i < dataObject.length ; i++) {
       arrayAttori.push(dataObject[i].original_name);
      };
      //pusho nell'oggetto film il corrispondete array di attori
      lista.forEach((item, indice) => {
        if(indexElementIdList === indice) {
          item.actors = arrayAttori;
        };
      });
    },

    //restituisce lista generi del film/serie tv
    genreCall: function(URL, listaSerieOrFilm) {
      axios.get(URL, {
        params: {
          api_key: this.apiKey,
          language: 'it-IT',
        },
      }).then((xhr) => {
        let dataObject = xhr.data.genres;
        listaSerieOrFilm.forEach((element) => {
          const {genre_ids} = element;
          let arrayGeneri = [];

          dataObject.forEach((genere) => {
            const {id, name} = genere;
            if(genre_ids.includes(genere.id)) {
              arrayGeneri.push(genere.name)
            };
          });
          element.generi = arrayGeneri;
        });
      });
    },

    /*per ogni id di film/serie tv (presente in listaId), esegue una chiamata ajax
    e successivamente la funzione thenCallsActors*/
    actorCallsFilm: function() {
      /*per ogni Id eseguo una chiamata ajax per ottenere i credits
      del film corrispondente*/
      this.listaIdFilm.forEach((element, index) => {
        axios.get(`https://api.themoviedb.org/3/movie/${element}/credits`, {
          params: {
            api_key: this.apiKey,
            language: 'en-US',
          },
        }).then((xhr) => {
          let dataObject = xhr.data.cast;
          this.thenCallsActors(this.listaFilm, dataObject, index)
        })
      });//end listaIdFilm.ForEach
    },

    actorCallsSerie: function() {
      this.listaIdSerie.forEach((element, index) => {
        axios.get(`https://api.themoviedb.org/3/tv/${element}/credits`, {
          params: {
            api_key: this.apiKey,
            language: 'en-US',
          },
        }).then((xhr) => {
          let dataObject = xhr.data.cast;
          this.thenCallsActors(this.listaSerie, dataObject, index)
        });
      });//end listaIdSerie.ForEach
    },

    /*restituisce nella struttura dell'oggetto le proprietà whiteStar e yellowStar
    utilizzate per il render delle stelline*/
    voteFive: function(lista) {
      let round;
      let whiteStar;
      let number_ws;
      lista.forEach((element) => {
        const {vote_average} = element;
        round = Math.round(element.vote_average / 2);
        element.yellowStar = round;
        whiteStars = this.maxVote - round;
        element.whiteStar = whiteStars;
      });
    },

    randomNumber: function (min, max) {
      var result = Math.floor(Math.random() * (max + 1 - min) + min);
      return result;
    },

    //ritorna all'imterno di listaTrend l'oggetto da mostare in homepage
    thenShowMostView: function() {
      this.listaTrend = [];
      let indexRandom = this.randomNumber(0, 20);
      this.listaTrend.push(this.dataListaTrend.results[indexRandom]);
      this.voteFive(this.listaTrend);
    },

    //ritorna la lista da renderizzare
    changeTab: function(indexClickedTab) {
      this.scelteIDX = indexClickedTab;
      if(this.scelteIDX == 0) {
        this.flagDisplayHome = true;
      } else if(this.scelteIDX == 1) {
        this.listaDaMostrare = this.listaFilm;
        this.flagDisplayHome = false;
        this.thenShowMostView();
      } else {
        this.listaDaMostrare = this.listaSerie;
        this.flagDisplayHome = false;
        this.thenShowMostView();
      }
    },

    //pusha in un array gli id di ogni film
    IdElemFunction: function(lista, listaId) {
      lista.forEach((element) => {
        const {id} = element;
        listaId.push(element.id)
      });
    },

    //evidenzia la tab selezionata
    selectedTab: function(indexSelectedTab) {
      const selected = 'btn-menu-active';
      if (indexSelectedTab === this.scelteIDX) {
        return selected;
      }
    },

    //flag per il render della lingua originale
    flagVisibility: function(index, lista) {
      const language = lista[index].original_language;
      if(this.lengFlagAv.includes(language)) {
        return true;
      } else {
        return false;
      }
    },

    //flag per il render della sinossi
    overview: function(index, lista) {
      const sinossi = lista[index].overview;
      if(sinossi !== "") {
        return true;
      } else {
        return false;
      }
    },

    //restituisce il percorso dell'immagine per il render della bandiera della lingua
    flagLang: function(index, lista) {
      const flagImage = lista[index].original_language;
      const imageString = `image/${flagImage}.svg`;
      return imageString;
    },

    //restituisce il percorso file dell'immagine di copertina
    imagePoster: function(index, lista, dimensioni) {
      const poster = lista[index].poster_path;
      let imageRender;
      if(poster == null) {
        imageRender = 'image/image-na.png';
      } else {
        imageRender = `https://image.tmdb.org/t/p/${dimensioni}${poster}`;
      }
      return imageRender;
    },

    //restituisce una stringa in base alla corrispondenza di risultati con la query
    queryResult: function() {
      if(this.listaFilm.length > 0 || this.listaSerie.length > 0) {
        return this.resultFor = `Risultati per: ${this.query}`;
      } else {
        return this.resultFor = `Nessun risultato per: ${this.query}`;
      }
    },

    //mostra l'alert in caso di ricerca con query vuota
    queryEmpty: function() {
      if(this.query == '' && this.scelteIDX !== 0 && this.listaDaMostrare.length === 0) {
        return true
      } else {
        return false
      }
    },

    /* flag che dopo 2 secondi mostra la sezione attori nella scheda film/serie,
    in modo da non rallentare il caricamento della pagina, dovuto alle molteplici chiamate ajax*/
    displayDelay: function() {
      setTimeout(() => {
        return this.flagDisplaySection = true;
      }, 2000)
    }
  }// end methods
});//end vue app

Vue.config.devtools = true;
