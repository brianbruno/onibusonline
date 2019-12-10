<template>
  <q-page class="flex flex-center">
    <div v-if="buscandoPontos">
      <h5>Buscando pontos próximos a sua localização...</h5>
    </div>
    <div v-if="textoParada">
      Parada: {{ textoParada }}
    </div>
    <ul>
      <li v-bind:key="previsao.sgLin" v-for="previsao in previsoes">
        {{ previsao.sgLin }} - {{ previsao.apelidoLinha}}
        {{ previsao.prev }}
      </li>
    </ul>
    <div class="row">
      <div id="mapid" style="width: 49vh; height: 60vh;"></div>
    </div>

  </q-page>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PageIndex',
  data () {
    return {
      location: null,
      gettingLocation: false,
      errorStr: null,
      buscandoPontos: false,
      objetoParada: {},
      paradas: [],
      previsoes: [],
      lib: null,
      mapa: null,
      textoParada: ''
    }
  },
  created () {
    const self = this
    // do we support geolocation
    if (!('geolocation' in navigator)) {
      this.errorStr = 'Geolocation is not available.'
      return
    }

    this.gettingLocation = true
    // get position
    navigator.geolocation.getCurrentPosition(pos => {
      this.gettingLocation = false
      this.location = pos
      self.configurarMapa()
    }, err => {
      this.gettingLocation = false
      this.errorStr = err.message
      alert(this.errorStr)
    })
  },
  methods: {
    configurarMapa () {
      const self = this
      // eslint-disable-next-line no-undef
      self.mapa = L.map('mapid').setView([self.location.coords.latitude, this.location.coords.longitude], 16)
      self.buscarPontos()

      // eslint-disable-next-line no-undef
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11'
      }).addTo(self.mapa)
    },
    buscarPontos: function () {
      const self = this
      const lat = self.location.coords.latitude
      const lon = this.location.coords.longitude
      self.buscandoPontos = true
      axios.post('https://wd89y2nqbe.execute-api.us-east-2.amazonaws.com/prod/pontos/proximos', {
        lat: lat.toString(),
        lon: lon.toString()
      })
        .then(function (response) {
          console.log(response)
          self.buscandoPontos = false
          if (response.data.errorMessage) {
            self.buscarPontos()
          } else {
            self.paradas = response.data.paradas
            self.plotarParadas()
          }
        })
        .catch(function (error) {
          console.log(error)
          self.buscandoPontos = false
        })
        .finally(function () {
          // always executed
        })
    },
    plotarParadas: function () {
      const self = this
      self.paradas.forEach((coord) => {
        self.objetoParada[coord.x + '#' + coord.y] = coord
        // eslint-disable-next-line no-undef
        L.marker([coord.y, coord.x]).addTo(self.mapa).on('click', function (e) {
          self.informacaoParada(e)
        })
      })
    },
    informacaoParada: function (e) {
      const self = this
      const concat = e.latlng.lng + '#' + e.latlng.lat
      self.textoParada = self.objetoParada[concat].desc

      axios.post('https://wd89y2nqbe.execute-api.us-east-2.amazonaws.com/prod/pontos/previsao', {
        codPonto: self.objetoParada[concat].cod
      })
        .then(function (response) {
          self.previsoes = response.previsoes
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function () {
          // always executed
        })
    }
  }
}

</script>
