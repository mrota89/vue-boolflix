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
    listaIdFilm: [],
    listaIdSerie: [],

    dataListaTrend: [],
    listaTrend: [],

    dataListaFilmHome: [],
    dataListaSerieHome: [],
    listaFilmHome: [],
    listaSerieHome: [],
    listaIdFilmHome: [],
    listaIdSerieHome: [],

    listaFilmHomeSlider: [],
    listaSerieHomeSlider: [],
    sliderIDXmin: 0,
    sliderIDXmax: 2,


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
      //effettua lo slide-show automatico dei titoli in homepage
      setInterval(() => {
        this.listaTrend = [];
        this.thenShowMostView();
      }, 10000);
    })

    //chiamate axios per popolare gli slider in homepage
    axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${this.apiKey}`)
    .then((xhr) => {
      this.dataListaFilmHome = xhr.data;
      this.listaIdFilmHome = [];
      this.listaFilmHomeSlider = [];
      this.listaFilmHome = this.dataListaFilmHome.results;
      this.voteFive(this.listaFilmHome);
      this.IdElemFunction(this.listaFilmHome, this.listaIdFilmHome);
      this.genreCall('https://api.themoviedb.org/3/genre/movie/list', this.listaFilmHome);
      this.actorCalls(`https://api.themoviedb.org/3/movie`, this.listaIdFilmHome, this.listaFilmHome);
      this.displayDelay();
      this.prev(this.listaFilmHome, this.listaFilmHomeSlider);
    })

    axios.get(`https://api.themoviedb.org/3/trending/tv/week?api_key=${this.apiKey}`)
    .then((xhr) => {
      this.dataListaSerieHome = xhr.data;
      this.listaIdSerieHome = [];
      this.listaSerieHome = this.dataListaSerieHome.results;
      this.voteFive(this.listaSerieHome);
      this.IdElemFunction(this.listaSerieHome, this.listaIdSerieHome);
      this.genreCall('https://api.themoviedb.org/3/genre/tv/list', this.listaSerieHome);
      this.actorCalls(`https://api.themoviedb.org/3/tv`, this.listaIdSerieHome, this.listaSerieHome);
      this.displayDelay();
      this.next(this.listaSerieHome, this.listaSerieHomeSlider);
    })
   },

  methods: {
    searchAll: function() {
      this.scelteIDX = 1;
      this.searchMovie();
      this.searchSeries();
      this.searchEmpty();
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
        this.actorCalls('https://api.themoviedb.org/3/movie', this.listaIdFilm, this.listaFilm);
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
        this.actorCalls('https://api.themoviedb.org/3/tv', this.listaIdSerie, this.listaSerie);
        this.displayDelay();
        this.queryResult();
      });
    },

    // restituisce l'esecuzione della chiamata axios per la query di ricerca
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
    actorCalls: function(URL, listaId, listaSerieOrFilm ) {
      /*per ogni Id eseguo una chiamata ajax per ottenere i credits
      del film corrispondente*/
      listaId.forEach((element, index) => {
        axios.get(URL + `/${element}/credits`, {
          params: {
            api_key: this.apiKey,
            language: 'en-US',
          },
        }).then((xhr) => {
          let dataObject = xhr.data.cast;
          this.thenCallsActors(listaSerieOrFilm, dataObject, index)
        })
      });//end listaId.ForEach
    },

    //scorrono array per array in homepage
    next: function(arrayDaFiltrare, arrayFiltrato) {
      arrayFiltrato.length = 0;
      this.sliderIDXmin += 3;
      this.sliderIDXmax += 3;
      if(this.sliderIDXmax >= arrayDaFiltrare.length) {
        this.sliderIDXmin = 0;
        this.sliderIDXmax = 2;
      }
    
      arrayDaFiltrare.forEach((element, index) =>  {
        if (index >= this.sliderIDXmin && index <= this.sliderIDXmax) {
          arrayFiltrato.push(element);
        }
      })
      return arrayFiltrato;
    },

    prev: function(arrayDaFiltrare, arrayFiltrato) {
      arrayFiltrato.length = 0;
      this.sliderIDXmin -= 3;
      this.sliderIDXmax -= 3;
      if(this.sliderIDXmin < 0) {
        this.sliderIDXmax = arrayDaFiltrare.length - 1;
        this.sliderIDXmin = arrayDaFiltrare.length - 3;
      }

      arrayDaFiltrare.forEach((element, index) =>  {
        if (index >= this.sliderIDXmin && index <= this.sliderIDXmax) {
          arrayFiltrato.push(element);
        }
      })
      return arrayFiltrato;
    },

    /*restituisce nella struttura dell'oggetto le proprietà whiteStar e yellowStar
    utilizzate per il render delle stelline*/
    voteFive: function(lista) {
      let round;
      let whiteStars;
      lista.forEach((element) => {
        const {vote_average} = element;
        round = Math.round(element.vote_average / 2);
        element.yellowStar = round;
        whiteStars = this.maxVote - round;
        element.whiteStar = whiteStars;
      });
    },

    randomNumber: function (min, max) {
      let result = Math.floor(Math.random() * (max + 1 - min) + min);
      return result;
    },

    //ritorna all'imterno di listaTrend l'oggetto da mostare in homepage
    thenShowMostView: function() {
      let indexRandom = this.randomNumber(0, 19);
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
      } else {
        this.listaDaMostrare = this.listaSerie;
        this.flagDisplayHome = false;
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
    imagePoster: function(percorsoImg, dimensioni) {
      let imageRender;
      if(percorsoImg == null) {
        imageRender = 'image/image-na.png';
      } else {
        imageRender = `https://image.tmdb.org/t/p/${dimensioni}${percorsoImg}`;
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

    searchEmpty: function() {
      if(this.query === '') {
        this.query = 'Inserire una parola chiave'
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
