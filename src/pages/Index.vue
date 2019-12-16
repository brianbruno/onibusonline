<template>
  <q-page class="flex flex-center">
    <!-- SOMENTE É EXIBIDO QUANDO O ESTADO É IGUAL A INICIO  -->
    <div class="row" v-if="estadoDaAplicacao === 'mapa'" >
      <div id="mapid" style="width: 375px; height: 500px;"></div>
    </div>

    <!-- SOMENTE É EXIBIDO QUANDO O ESTADO DA APLICAÇÃO É BUSCANDO -->
    <div v-if="estadoDaAplicacao === 'buscando'">
      <h5>Buscando pontos próximos a sua localização...</h5>
    </div>

    <q-dialog v-model="card">
      <q-card>
        <q-img src="https://images.brian.place/bus.jpg" />

        <q-card-section>
          <q-btn
            round
            color="dark"
            icon="star"
            class="absolute"
            style="top: 0px; right: 12px; transform: translateY(-50%);"
          />
          <div class="row items-center">
            <div class="col text-h6 ellipsis">{{ paradaInfo.nome }}</div>
            <div class="distanciaCss text-grey q-pt-md">
              <q-icon name="place" /> {{ paradaInfo.distancia }} m
            </div>
          </div>

          <!-- <q-rating v-model="stars" :max="5" size="32px" /> -->
        </q-card-section>

        <div v-if="buscandoPrevisoes" class="text-center">
          <q-circular-progress
            indeterminate
            size="50px"
            color="lime"
            class="q-ma-md"
          />
        </div>
        <q-list bordered separator>
          <q-item v-ripple>
            <q-item-section>
              <q-item-section v-bind:key="linha" v-for="linha in Object.keys(paradaInfo.previsoes)">
                <div class="text-subtitle2">{{ linha }}</div>
                <q-card-section v-bind:key="previsao.id" v-for="previsao in paradaInfo.previsoes[linha]">
                  <q-btn flat v-close-popup v-on:click="plotarOnibus(previsao.codItinerario)">{{ previsao.prev }}</q-btn>
                </q-card-section>
              </q-item-section>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
  .distanciaCss {
    position: absolute;
    right: 225px;
    height: 2px;
  }
  </style>

<script>
import axios from 'axios'

export default {
  name: 'PageIndex',
  data () {
    return {
      estadoDaAplicacao: 'mapa',
      location: null,
      gettingLocation: false,
      errorStr: null,
      objetoParada: {},
      paradas: [],
      previsoes: [],
      lib: null,
      mapa: null,
      textoParada: '',
      buscandoPrevisoes: false,
      card: false,
      paradaInfo: {
        nome: '',
        numero: '',
        distancia: '',
        previsoes: []
      },
      stars: 3,
      LeafIcon: null
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
      self.mapa = L.map('mapid').setView([self.location.coords.latitude, self.location.coords.longitude], 16)
      self.buscarPontos(self.location.coords.latitude, self.location.coords.longitude)

      // eslint-disable-next-line no-undef
      self.LeafIcon = L.Icon.extend({
        options: {
          iconSize: [45, 45]
        }
      })
      let userIcon = new self.LeafIcon({ iconUrl: 'http://images.brian.place/user.png' })
      // eslint-disable-next-line no-undef
      L.marker([self.location.coords.latitude, self.location.coords.longitude], { icon: userIcon }).addTo(self.mapa)

      self.mapa.on('moveend', function () {
        const center = self.mapa.getCenter()
        self.buscarPontos(center.lat, center.lng)
      })

      // eslint-disable-next-line no-undef
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11'
      }).addTo(self.mapa)
    },
    buscarPontos: function (lat, lon) {
      const self = this
      // const lat = self.location.coords.latitude
      // const lon = self.location.coords.longitude

      // self.estadoDaAplicacao = 'buscando'

      axios.get('https://bhonibus.brian.place/pontos/proximos/' + lat + '/' + lon)
        .then(function (response) {
          console.log(response)
          self.estadoDaAplicacao = 'mapa'
          if (response.data.errorMessage) {
            self.buscarPontos(lat, lon)
          } else {
            self.paradas = response.data.paradas
            self.plotarParadas()
          }
        })
        .catch(function (error) {
          console.log(error)
          self.estadoDaAplicacao = 'mapa'
        })
        .finally(function () {
          // always executed
        })
    },
    plotarParadas: function () {
      const self = this
      // eslint-disable-next-line no-undef
      self.LeafIcon = L.Icon.extend({
        options: {
          iconSize: [35, 45]
        }
      })
      let busIcon = new self.LeafIcon({ iconUrl: 'https://images.brian.place/bus_icon.png' })
      self.paradas.forEach((coord) => {
        if (!self.objetoParada[coord.x + '#' + coord.y]) {
          self.objetoParada[coord.x + '#' + coord.y] = coord
          // eslint-disable-next-line no-undef
          L.marker([coord.y, coord.x], { icon: busIcon }).addTo(self.mapa).on('click', function (e) {
            self.informacaoParada(e)
          })
        }
      })
    },
    informacaoParada: function (e) {
      const self = this
      const concat = e.latlng.lng + '#' + e.latlng.lat
      // self.estadoDaAplicacao = 'selecionado'
      self.card = true
      self.paradaInfo.distancia = self.distance(self.location.coords.latitude, self.location.coords.longitude, e.latlng.lat, e.latlng.lng, 'M')

      self.paradaInfo.nome = self.objetoParada[concat].desc
      self.buscandoPrevisoes = true
      self.paradaInfo.previsoes = {}

      axios.post('https://wd89y2nqbe.execute-api.us-east-2.amazonaws.com/prod/pontos/previsao', {
        codPonto: self.objetoParada[concat].cod.toString()
      })
        .then(function (response) {
          if (self.objetoParada[concat]) {
            let previsoes = response.data.previsoes

            // Accepts the array and key
            const groupBy = (array, key) => {
              // Return the end result
              return array.reduce((result, currentValue) => {
                // If an array already present for key, push it to the array. Else create an array and push the object
                (result[currentValue[key]] = result[currentValue[key]] || []).push(
                  currentValue
                )
                // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
                return result
              }, {}) // empty object is the initial value for result object
            }

            // Group by color as key to the person array
            previsoes = groupBy(previsoes, 'sgLin')

            self.objetoParada[concat]['previsoes'] = previsoes
            self.paradaInfo.previsoes = self.objetoParada[concat]['previsoes']
          } else {
            self.mensagemPrevisao = response.data.mensagem
            self.previsoes = response.data.previsoes
          }
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function () {
          self.buscandoPrevisoes = false
        })
    },
    distance (lat1, lon1, lat2, lon2, unit) {
      if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0
      } else {
        let radlat1 = Math.PI * lat1 / 180
        let radlat2 = Math.PI * lat2 / 180
        let theta = lon1 - lon2
        let radtheta = Math.PI * theta / 180
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
        if (dist > 1) {
          dist = 1
        }
        dist = Math.acos(dist)
        dist = dist * 180 / Math.PI
        dist = dist * 60 * 1.1515
        if (unit === 'K') { dist = (dist * 1.609344) }
        if (unit === 'M') { dist = ((dist * 1.609344) * 1000).toFixed(2) }
        if (unit === 'N') { dist = dist * 0.8684 }
        return dist
      }
    },
    plotarOnibus (codItinerario) {
      axios.get('https://bhonibus.brian.place/veiculos/mapa/' + codItinerario)
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function () {
          self.buscandoPrevisoes = false
        })
    }
  }
}

</script>
