import Vue from 'vue'
import App from './App.vue'
import List from './components/ProductList.vue'

Vue.config.productionTip = false
var vueApp;

	
function initProduct(response){
  List.prodList = JSON.parse(response);
  startVue();
}

// init array of products
ajax("list", initProduct, "get", "https://mdx-shopnow.herokuapp.com/lessons");



function startVue(){
  vueApp = new Vue({
    render: h => h(App)
  }).$mount('#app')
}
