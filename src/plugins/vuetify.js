import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)
// {

//   icons: {
//     iconfont: 'mdi',
//   },
// }
export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    themes: {
      light: {
        primary: '#DDD',
        secondary: colors.amber.lighten2, // #FFCDD2
        accent: colors.indigo.base, // #3F51B5
      },
      dark: {
        secondary: colors.red.lighten4, // #FFCDD2
        accent: colors.indigo.base, // #3F51B5
      },
    },
  },
})
