
var vueApp = new Vue({
    el: '#app',
    data: {
        // array of JSON objects
        products: [arts, astronomy, biology, chemistry, computerScience, english, geography, geometry, maths, music],
        cart:[],
        sitename: 'After School Club',
    },
    methods:{

        validInput: function(elem){
            if(typeof(elem) == "object" || typeof(elem) == "number"){
                 if(typeof(elem) == "object") return 1;
                else if(typeof(elem) == "number") return 2;
            }else return 0;
            return 0;
        },

        getProduct: function(elem){

            switch(this.validInput(elem)){
                case 1: return elem; // object case
                case 2: return this.products[elem]; // number case
                default: console.log("Wrong getProduct() parameter!");
                    return false; // wrong value case
            }
        },

        addToCart: function(elem){
            const product = this.getProduct(elem);

            if(product){
                product.spaces--;
                this.cart.push(product.id);
                return true;
            }else return false;
        },

        canAddToCart: function(elem){
            const product = this.getProduct(elem);

            if(product) return product.spaces > 0;
            else false;
        }
    },

    computed:{

        cartItemCount: function(){
            return this.cart.length;
        },
    }
});