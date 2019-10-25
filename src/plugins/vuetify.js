import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)
export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    themes: {
      light: {
        primary: 'hsla(185, 9%, 25%, 0.9)',
        secondary: colors.amber.lighten2, // #FFCDD2
        accent: colors.indigo.base, // #3F51B5
      },
      dark: {
        primary: 'hsla(185, 9%, 25%, 0.9)',
        secondary: colors.red.lighten4, // #FFCDD2
        accent: colors.indigo.base, // #3F51B5
      },
    },
  },
})
