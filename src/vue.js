var vueApp = new Vue({
    el: '#app',
    data: {
        sitename: 'After School Club',
        cart:[],
        product: {
            scope: this,
            id: 3377,
            title: 'Maths',
            location: 'London',
            price: 'Price: £100',
            image: "./assets/math.png",
            btn: 'Add To Cart',
            spaces: 5,

            addToCart: function(){
                const cart = this.scope.vueApp.cart;
                cart.push(this.id);
                this.spaces--;
            },
        }
    },
    methods:{
        AddToCart: function(){ this.product.addToCart(); }
    },

    computed:{
        cartItemCount: function(){
            return this.cart.length || '';
        },
        canAddToCart: function(){
            return this.product.spaces > 0;
        } 
    }
});